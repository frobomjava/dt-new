module.exports = {
  retrieveAllProjects: function (callback) {
    Project.find().exec(function (err, projects) {
      if (err) {
        return callback(err);
      }
      return callback(null, projects);
    });
  },

  projectNameExists: function (projectName, callback) {
    Project.findOne().exec(function (err, project) {
      if (err) {
        return callback(err);
      }
      if (!project) {
        return callback(null, false);
      }
      return callback(null, true);
    });
  },

  createProject: function (projectData, callback) {
    Project.create(projectData).exec(function (err, createdProject) {
      if (err) {
        return callback(err);
      }
      if (createdProject) {
        return callback(null, createdProject);
      }

      var error = {
        appMessage: "Project could not be created."
      };
      return callback(error);
    });
  },

  createProjectDirectory: function (path, callback) {
    var fs = require('fs-extra');
    fs.ensureDir(path, function (err) {
      if (err) {
        return callback(err);
      }
      return callback();
    })
  },

  findProject: function (data, callback) {
    Project.findOne(data).exec(function (err, projet) {
      if (err) {
        return callback(err);
      }
      if (project) {
        return callback(null, project);
      }
      var error = {
        appMessage: 'Project does not exist'
      };
      return callback(error);
    });
  },

  findProjectByOwnerUser: function (data, callback) {
    Project.findOne(data).exec(function (err, project) {
      if (err) {
        return callback(err);
      }
      if (project) {
        return callback(null, project);
      }
      var error = {
        appMessage: 'Project does not exist'
      };
      return callback(error);
    });
  },

  projectExists: function (data, callback) {
    Project.findOne(data).exec(function (err, project) {
      if (err) {
        return callback(err);
      }
      if (project) {
        return callback(null, true);
      }
      return callback(null, false);
    });
  },

  validateProjectCreation: function (projectData, validationCallback) {
    var self = this;
    var validationErrorMessages = null;
    async.series([
        function userProjectExists(callback) {
          var options = {
            projectName: projectData.projectName,
            owner: projectData.owner
          };
          self.projectExists(options, function (err, exists) {
            if (err) {
              return callback(err);
            }
            if (exists) {
              validationErrorMessages = validationErrorMessages || {};
              validationErrorMessages.projectExists = "Project already exists";
            }
            return callback();
          });
        }
      ],
      function done(err) {
        if (err) {
          return validationCallback(err);
        }
        if (validationErrorMessages) {
          return validationCallback({
            validationErrorMessages: validationErrorMessages
          });
        }
        return validationCallback();
      });
  },

  findProjectsByOwnerUser: function (projectData, callback) {
    Project.find({
      owner: projectData.owner
    }).exec(function (err, projects) {
      if (err) {
        return callback(err);
      }
      return callback(null, projects);
    });
  },

  findProjectsByMemberUser: function (userId, callback) {
    Project.find().populate('members').exec(function (err, projects) {
      if (err) {
        return callback(err);
      }
      var memberProjects = projects.filter(function (project) {
        var result = project.members.filter(function (member) {
          return member.id == userId;
        });
        return result.length > 0; // project.owner != req.user.id;
      });
      return callback(null, memberProjects);
    });
  },

  addMemberToProject: function (userName, projectId, mainCallback) {
    var self = this;
    async.waterfall([
        function (callback) {
          self.findProjectByPopulatingMembers(projectId, function (err, project) {
            if (err) {
              return callback(err);
            }
            return callback(null, project);
          });
        },
        function findUser(project, callback) {
          User.findOne({
            userName: userName
          }).exec(function (err, user) {
            if (err) {
              return callback(err);
            }
            if (!user) {
              var error = {
                appMessage: 'User not found'
              };
              return callback(error);
            }
            callback(null, user, project);
          });
        },
        function addUserToProject(user, project, callback) {
          project.members.add(user.id);
          project.save(function (err) {
            if (err) {
              return callback(err);
            }
            callback(null, user);
          });
        }
      ],
      function (err, user) {
        if (err) {
          return mainCallback(err);
        }
        return mainCallback(null, user);
      });
  },

  removeMemberFromProject: function (userId, projectId, mainCallback) {
    var self = this;
    async.waterfall([
        function (callback) {
          self.findProjectByPopulatingMembers(projectId, function (err, project) {
            if (err) {
              return callback(err);
            }
            return callback(null, project);
          });
        },
        function removeUserFromProject(project, callback) {
          project.members.remove(userId);
          project.save(function (err) {
            if (err) {
              return callback(err);
            }
            return callback();
          });
        },
        function (callback) {
          self.findProjectByPopulatingMembers(projectId, function (err, project) {
            if (err) {
              return callback(err);
            }
            return callback(null, project.members);
          });
        }
      ],
      function (err, updatedMembers) {
        if (err) {
          return mainCallback(err);
        }
        return mainCallback(null, updatedMembers);
      });
  },

  findProjectByPopulatingMembers: function (projectId, callback) {
    Project.findOne({
      id: projectId
    }).populate('members').exec(function (err, project) {
      if (err) {
        return callback(err);
      }
      if (!project) {
        var error = {
          appMessage: 'Project not found'
        };
        return callback(error);
      }
      return callback(null, project);
    });
  },

  findProjectByPopulatingResources: function (projectId, callback) {
    Project.findOne({
      id: projectId
    }).populate('resources').exec(function (err, project) {
      if (err) {
        return callback(err);
      }
      if (!project) {
        var error = {
          appMessage: 'Project not found'
        };
        return callback(error);
      }
      return callback(null, project);
    });
  },

  addResource: function (resource, project, callback) {
    project.resources.add(resource.id);
    project.save(function (err) {
      if (err) {
        return callback(err);
      }
      callback();
    });
  }
}
