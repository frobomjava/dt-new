var ProjectUtil = require('./ProjectUtil.js');
module.exports = {
  createResource: function (resourceData, callback) {
    Resource.create(resourceData).exec(function (err, resource) {
      if (err) {
        return callback(err);
      }
      if (resource) {
        return callback(null, resource);
      }

      var error = {
        appMessage: "Resource could not be created."
      };
      return callback(error);
    });
  },

  createResourceDirectory: function (path, callback) {
    var fs = require('fs-extra');
    fs.ensureDir(path, function (err) {
      if (err) {
        return callback(err);
      }
      return callback();
    })
  },

  findResourceById: function (resourceId, callback) {
    Resource.findOne({
      id: resourceId
    }).exec(function (err, resource) {
      if (err) {
        return callback(err);
      }
      if (resource) {
        return callback(null, resource);
      }
      var error = {
        appMessage: 'Resource not found'
      };
      return callback(error);
    });
  },

  findResourceByIdByPopulatingChildren: function (resourceId, callback) {
    Resource.findOne({
      id: resourceId
    }).populate('children').exec(function (err, resource) {
      if (err) {
        return callback(err);
      }
      if (resource) {
        return callback(null, resource);
      }
      var error = {
        appMessage: 'Resource not found'
      };
      return callback(error);
    });
  },

  addChildResource: function (childResource, parentResource, callback) {
    parentResource.children.add(childResource.id);
    parentResource.save(function (err) {
      if (err) {
        return callback(err);
      }
      callback();
    });
  },

  createAndAddToProject: function (resourceData, project, mainCallback) {
    var self = this;
    async.waterfall([
        function (callback) {
          self.createResource(resourceData, function (err, resource) {
            if (err) {
              return callback(err);
            }
            callback(null, resource);
          });
        },
        function createFolderOrFile(resource, callback) {
          if (resource.resourceType == 'folder') {
            self.createResourceDirectory(resource.url, function (err) {
              if (err) {
                return callback(err);
              }
              return callback(null, resource);
            });
          }
          if (resource.resourceType == 'file') {
            self.createResourceFile(resource.url, function (err) {
              if (err) {
                return callback(err);
              }
              return callback(null, resource);
            });
          }
        },
        function (resource, callback) {
          ProjectUtil.addResource(resource, project, function (err) {
            if (err) {
              return callback(err);
            }
            return callback(null, resource);
          })
        }
      ],
      function (err, resource) {
        if (err) {
          return mainCallback(err);
        }
        return mainCallback(null, resource);
      });
  },

  createAndAddToParentResource: function (resourceData, parentResource, mainCallback) {
    var self = this;
    async.waterfall([
        function (callback) {
          self.createResource(resourceData, function (err, resource) {
            if (err) {
              return callback(err);
            }
            callback(null, resource);
          });
        },
        function createFolderOrFile(resource, callback) {
          if (resource.resourceType == 'folder') {
            self.createResourceDirectory(resource.url, function (err) {
              if (err) {
                return callback(err);
              }
              return callback(null, resource);
            });
          }
          if (resource.resourceType == 'file') {
            self.createResourceFile(resource.url, function (err) {
              if (err) {
                return callback(err);
              }
              return callback(null, resource);
            });
          }

        },
        function (resource, callback) {
          self.addChildResource(resource, parentResource, function (err) {
            if (err) {
              return callback(err);
            }
            return callback(null, resource);
          })
        }
      ],
      function (err, resource) {
        if (err) {
          return mainCallback(err);
        }
        return mainCallback(null, resource);
      });
  },

  createResourceFile: function (path, callback) {
    var jsonFile = require('jsonfile');
    var dtFileJSONData = {
      names: {
        conditions: [""],
        actions: [""]
      },

      rules: [{
        conditions: [""],
        actions: [""]
      }, ]
    };
    jsonFile.writeFile(path, dtFileJSONData, function (err) {
      if (err) {
        return callback(err);
      }
      return callback();
    });

  }
}
