/**
 * ResourceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See http://sailsjs.com/docs/concepts/controllers
 */
var ProjectUtil = require('../utils/ProjectUtil.js');
var ResourceUtil = require('../utils/ResourceUtil');
module.exports = {
  create: function (req, res) {
    console.log("===resource create===");

    var projectData = {
      id: req.param('projectId')
    };
    var projectId = req.param('projectId');
    var parentID = req.param('nodeID');
    var childID = null;
    console.log("== parentID == " + parentID);
    console.log(req.param('resourceType'));
    var resourceData = {
      name: req.param('resourceName'),
      url: "",
      resourceType: req.param('resourceType'),
      createdBy: req.user.id
    }
    if (!parentID) {
      console.log("Parent id does not exist");
      async.waterfall([
          function findParentProject(callback) {
            ProjectUtil.findProjectByPopulatingResources(projectId, function (err, project) {
              if (err) {
                return callback(err);
              }
              return callback(null, project);
            });
          },
          function (project, callback) {
            resourceData.url = project.url + '/' + req.param('resourceName');
            ResourceUtil.createAndAddToProject(resourceData, project, function (err, resource) {
              if (err) {
                return callback(err);
              }
              return callback(null, resource);
            });
          }
        ],
        function (err, resource) {
          if (err) {
            return res.serverError(err);
          }
          console.log('##### '+ resource.name + ' Resource is created #####');
          console.log('ProjectId/resourceId : ' + projectId + '/' + resource.id);
          sails.sockets.broadcast(projectId, 'new-resource', resource, req);
          console.log("broadcasted!");
          return res.json(resource);
        });
    } else {
      console.log();
      console.log("Parent is exist.<new>");
      async.waterfall([
          function findParentResource(callback) {
            ResourceUtil.findResourceByIdByPopulatingChildren(parentID, function (err, parentResource) {
              if (err) {
                return callback(err);
              }
              return callback(null, parentResource);
            });
          },
          function (parentResource, callback) {
            resourceData.url = parentResource.url + '/' + req.param('resourceName');
            resourceData.parent = parentResource.id;
            ResourceUtil.createAndAddToParentResource(resourceData, parentResource, function (err, resource) {
              if (err) {
                return callback(err);
              }
              return callback(null, resource);
            });
          }
        ],
        function (err, resource) {
          if (err) {
            return res.serverError(err);
          }
          console.log('##### Resource is created #####');
          console.log('ProjectId/resourceId : ' + projectId + '/' + resource.id);
          sails.sockets.broadcast(projectId, 'new-resource', resource, req);
          console.log("broadcasted!");
          return res.json(resource);
          
        });
    }
  },

  getData: function (req, res) {
    var resourceId = req.param('resourceId');
    var jsonFile = require('jsonfile');
    async.waterfall([
        function findResource(callback) {
          ResourceUtil.findResourceById(resourceId, function (err, resource) {
            if (err) {
              return callback(err);
            }
            return callback(null, resource);
          });
        },
        function readData(resource, callback) {
          jsonFile.readFile(resource.url, function (err, jsonData) {
            if (err) {
              return callback(err);
            }
            return callback(null, jsonData);
          });
        }
      ],
      function (err, jsonData) {
        if (err) {
          return res.serverError(err);
        }
        return res.json(jsonData);
      });
  },

  saveData: function (req, res) {
    var id = req.param('resourceId');
    var data = req.param('data');
    async.waterfall([
        function (callback) {
          var criteria = {
            id: id,
            resourceType: 'file'
          };
          Resource.findOne(criteria).exec(function (err, resource) {
            if (err) {
              return callback(err);
            }
            if (!resource) {
              return callback({
                message: 'No resource'
              });
            }
            return callback(null, resource);
          })
        },
        function (resource, callback) {
          var fs = require('fs');
          fs.writeFile(resource.url, JSON.stringify(data), function (err) {
            if (err) {
              return callback(err);
            }
            return callback();
          });
        }
      ],
      function (err) {
        if (err) {
          return res.serverError(err);
        }
        res.ok();
      });
  },

  download: function(req, res) {
    var id = req.param('resourceId');
    async.waterfall([
      function (callback) {
        var criteria = {
          id: id,
          resourceType: 'file'
        };
        Resource.findOne(criteria).exec(function (err, resource) {
          if (err) {
            return callback(err);
          }
          if (!resource) {
            return callback({message: 'No resource'});
          }
          return callback(null, resource);
        })
      },
      function (resource, callback) {
        console.log('resource.url : ' + resource.url);
        var fs = require('fs');
        var resourceJSON = JSON.parse(fs.readFileSync(resource.url, 'utf8'));
        return res.json(resourceJSON);
      }
    ],
    function (err) {
      if (err) {
        return res.serverError(err);
      }
    });
  },

  delete : function(req, res) {
    console.log();
    console.log('##### ResourceController delete action #####');
    var resourceId = req.param('resourceId');
    var projectId = req.param('projectId');
    var resourceUrl;
    async.waterfall([
      function (callback) {
        var criteria = {
          id: resourceId,
          resourceType: 'file'
        };
        Resource.findOne(criteria).exec(function (err, resource) {
          if (err) {
            return callback(err);
          }
          if (!resource) {
            return callback({
              message: 'No resource'
            });
          }
          resourceUrl = resource.url;
          console.log('resourceUrl : ' + resourceUrl);
          return callback(null, resource);
        })
      },
      function (resource, callback) {
        console.log('parentResource : ' + JSON.stringify(resource.parent));
        if (resource.parent) {
          ResourceUtil.findResourceByIdByPopulatingChildren(resource.parent, function (err, parentResource) {
            if (err) {
              return callback(err);
            }
            ResourceUtil.removeChildResource(resource, parentResource, function (err) {
              if (err) {
                return callback(err);
              }
            });
          });
        }
        else {
          ProjectUtil.findProjectByPopulatingResources(projectId, function (err, project) {
            if (err) {
              return callback(err);
            }
            if (project) {
              ProjectUtil.removeResource(resourceId, project, function (err) {
                if (err) {
                  return callback(err);
                }
                // return res.ok({message : 'resource is deleted..'});
              })
            }
          });
        }
        ResourceUtil.deleteResource(resource.id, function (err, result) {
          if (err) {
            return callback(err);
          }
          return callback(null, result);
        })
    },
    function (isResourceDeleted, callback) {
      if (isResourceDeleted) {
        const fs = require('fs-extra')

        fs.remove(resourceUrl, function (err) {
          if (err) {
            return callback(err);
          }
          console.log(resourceUrl + ' is deleted...');
          return res.ok({message : 'resource is deleted..'});
        });

        // fs.stat('./server/upload/my.csv', function (err, stats) {
      //    console.log(stats);//here we got all information of file in stats variable
      //
      //    if (err) {
      //        return console.error(err);
      //    }
      //
      //    fs.unlink('./server/upload/my.csv',function(err){
      //         if(err) return console.log(err);
      //         console.log('file deleted successfully');
      //    });
      // });
      }
    }
    ],
    function (err) {
      if (err) {
        return res.serverError(err);
      }
    });
  }

};
