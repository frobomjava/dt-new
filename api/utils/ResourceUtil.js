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

  removeChildResource: function (childResource, parentResource, callback) {
    console.log('parentResource.children : ' + JSON.stringify(parentResource.children));
    parentResource.children.remove(childResource.id);
    parentResource.save(function (err) {
      if (err) {
        return callback(err);
      }
      console.log('<><><> childResource is removed <><><>');
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
  },

  deleteResource: function (resourceId, callback) {
    Resource.destroy({
      id: resourceId
    }).exec(function (err) {
      if (err) {
        console.log(JSON.stringify(err));
        return res.json(err);
      }
      console.log('##### Resource is destroyed #####');
      return callback(null, true);
    });
  },

  readFile: function(path, callback) {
    console.log('*** ResourceUtil.readFile ***');
    console.log('path : ' + path);
    var fs = require('fs');
    fs.readFile(path, "utf8", function read(err, data) {
        if (err) {
            return callback(err);
        }
        
        console.log('data : ' + data);
        console.log('****************************************');
        return callback(null, data);
    });
  },

  createJSFile: function (path, data, callback) {
    var fs = require('fs');
    fs.writeFile(path, data, function (err) {
      if (err) {
        return callback(err);
      }
      return callback(null, true);
    });
  },

  createJSFileAndAddToProject: function (resourceData, project, data, mainCallback) {
    console.log('*** ResourceUtil.createJSFileAndAddToProject ***');
    var self = this;
    async.waterfall([
        function createFile(callback) {

          if (resourceData.resourceType == 'file') {
            self.createJSFile(resourceData.url, data, function (err, success) {
              if (err) {
                return callback(err);
              }
              return callback(null, success);
            });
          }
        },
        function (success, callback) {
          self.createResource(resourceData, function (err, resource) {
            if (err) {
              return callback(err);
            }
            callback(null, resource);
          });
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

  createJSFileAndAddToParentResource: function (resourceData, parentResource, data, mainCallback) {
    console.log('*** ResourceUtil.createJSFileAndAddToParentResource ***');
    var self = this;
    async.waterfall([

        function createFile(callback) {

          if (resourceData.resourceType == 'file') {
            self.createJSFile(resourceData.url, data, function (err, success) {
              if (err) {
                return callback(err);
              }
              return callback(null, success);
            });
          }
        },
        function (success, callback) {
          self.createResource(resourceData, function (err, resource) {
            if (err) {
              return callback(err);
            }
            return callback(null, resource);
          });
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
  }
}
