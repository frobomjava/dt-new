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
  }

};
