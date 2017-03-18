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
      createdBy: req.param('userId')
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
            resourceData.url = project.url + '/' + req.param('resourceName') + '.dt';
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
          //resourceData = resource;
          //resourceData.userName = req.user.userName;
          console.log('##### '+ resource.name + ' Resource is created #####');
          console.log('ProjectId/resourceId : ' + projectId + '/' + resource.id);
          console.log('resource : ' + JSON.stringify(resource));
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
          // resourceData = resource;
          // resourceData.userName = req.user.userName;
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
    var projectId = req.param('projectId');
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
            return callback(null, resource);
          });
        }
      ],
      function (err, resource) {
        if (err) {
          return res.serverError(err);
        }

        if(req.isSocket === true) {
          //resource.userName = req.param('userName');
          sails.sockets.broadcast(projectId, 'changed-resource', resource, req);
           console.log("broadcast for saveData successful");
           return res.json(resource);
        }
        // res.ok();
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
    var deletedResource = null;
    async.waterfall([
      function (callback) {
        var criteria = {
          id: resourceId
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
          deletedResource = resource;
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
                //return callback();
              })
            }
          });
        }
        ResourceUtil.deleteResource(resource.id, function (err, result) {
          if (err) {
            return callback(err);
          }
          return callback(null, result);
        });
    },
    function (isResourceDeleted, callback) {
      if (isResourceDeleted) {
        const fs = require('fs-extra')

        fs.remove(resourceUrl, function (err) {
          if (err) {
            return callback(err);
          }
          console.log(resourceUrl + ' is deleted...');
          //deletedResource.userName = req.user.userName;
          console.log('deletedResource :' + JSON.stringify(deletedResource));
          sails.sockets.broadcast(projectId, 'delete-resource', deletedResource, req);
          console.log("*** delete broadcast successful *** ");
          //return res.ok({message : 'resource is deleted..'});
          return res.json(deletedResource);
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
  },
  generateCode: function(req, res) {
    var resourceId = req.param('resourceId');
    var projectId = req.param('projectId');
    var resourceData;

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
            return callback({message: 'No resource'});
          }
          resourceData = resource;
          console.log("parentResource : " + resourceData.parent);
          delete resourceData.id;
          console.log();
          console.log('#  resourceData : ' + JSON.stringify(resourceData));
          console.log();
          return callback(null, resource);
        })
      },
      function (resource, callback) {
        console.log('resource.url : ' + resource.url);
        ResourceUtil.readResourceFile(resource.url, function (err, resourceJSON) {
          if (err) {
            return callback(err);
          }
          console.log('==== readResourceFile finished ====');
          return callback(null, resourceJSON);
        });
      },
      function (resourceJSON, callback) {
        var data = "function dt () {\n" ;
        var firstRule = true;

        resourceJSON.rules.map(function (rule) {
          var count = 0;
          if (firstRule) {
            data += "\tif(";
            firstRule = false;
          }
          else {
              data += "\n\telse if( ";
          }

          async.series([
            function(done) {
              console.log('first thing')
              rule.conditions.map(function (condition) {
                ++count;
                if (count != rule.conditions.length) {
                  data += condition + ' && ' ;
                }
                else {
                  data += condition + ') {\n';
                }
              });
              done()
            },
            function(done) {
              console.log('second thing')
              rule.actions.map(function (action) {
                console.log('action : ' + action);
                data += '\t\t' + action + '\n';
              });
              data += '\t}';
            },
          ], function(err) {
            if (err) {
              console.log(err.message);
            }
          });

        });//end of rule map

        data += '\n}\n';
        console.log('data : ' + data);
        return callback(null, data);
      },
      function (data, callback) {

        if (!resourceData.parent) {
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
                resourceData.name = resourceData.name + '.js';
                resourceData.url = project.url + '/' + resourceData.name;
                ResourceUtil.createJSFileAndAddToProject(resourceData, project, data, function (err, resource) {
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
              console.log("new-resource broadcasted!");
              return res.json(resource);
            });
        }
        else {
          console.log();
          console.log("Parent is exist.<new>");
          async.waterfall([
              function findParentResource(callback) {
                ResourceUtil.findResourceByIdByPopulatingChildren(resourceData.parent, function (err, parentResource) {
                  if (err) {
                    return callback(err);
                  }
                  return callback(null, parentResource);
                });
              },
              function (parentResource, callback) {
                resourceData.name = resourceData.name + '.js';
                resourceData.url = parentResource.url + '/' + resourceData.name;
                resourceData.parent = parentResource.id;
                ResourceUtil.createJSFileAndAddToParentResource(resourceData, parentResource, data, function (err, resource) {
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
              console.log("new-resource broadcasted!");
              return res.json(resource);
            });
        }//end of else

        //return res.json(resourceJSON);
      }
    ],
    function (err) {
      if (err) {
        return res.serverError(err);
      }
    });
  },

  getChildren: function(req, res) {
    console.log("************getChildren****************");
    var resourceId = req.param('resourceId');
    console.log("resource id is " + resourceId);
    Resource.findOne({id: resourceId}).populate('children').exec(function(err, resource) {
      if (err) {
        res.serverError(err);
      }
      res.json(resource.children);
    })
  }

};
