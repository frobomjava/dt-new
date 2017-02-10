/**
 * ResourceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See http://sailsjs.com/docs/concepts/controllers
 */

module.exports = {


};

/**
* ResourceController
*
* @description :: Server-side actions for handling incoming requests.
* @help        :: See http://sailsjs.com/docs/concepts/controllers
*/

module.exports = {
  create: function(req,res) {
    console.log("===resource create===");

    var projectData = {
      projectName: req.param('projectName')
    }
    var parentID = req.param('nodeID');
    var childID = null;
    console.log("== parentID == " + parentID);
    var resourceData = {
      name: req.param('resourceName'),
      url: "",
      resourceType: req.param('resourceType'),
      createdBy: req.user.id
    }
    if(!parentID){
      async.series(
          [
            function findProject(callback){
              Project.findOne({projectName:projectData.projectName}).exec(function (err, project){
                if (err) {
                   callback(err);
                 } else {
                   resourceData.url = project.url + '/' + req.param('resourceName') ;
                   callback();
                 }
               });
            },
            function createResource(callback){
                Resource.create(resourceData).exec(function(err, data){
                  if (err) {
                    callback(err);
                  } else {
                    childID = data.id;
                    var resourceDir = data.url;
                    var filessystem = require('fs');
                    if (!filessystem.existsSync(resourceDir)) {
                      filessystem.mkdirSync(resourceDir);
                      callback();
                    }
                    return res.json(data);
                  }
                });
              },
              function setResource(callback){
                Project.findOne({projectName:projectData.projectName}).populate('resources').exec(function (err, project){
                  if (err) { return res.serverError(err); }
                  if (!project) { return res.notFound('Could not find a project.'); }
                  project.resources.add(childID);
                  project.save(function(err){
                    if (err) { return res.serverError(err); }
                    // return res.json(data);
                  });
                });
              }
          ],
  	       function(err) {
             return res.json(err);
  	        }
          );
        } else {
          console.log();
          console.log("Parent is exist.");
      async.series(
          [
            function findResource(callback){
              Resource.findOne({id: parentID}).exec(function(err,parentResource){
                if (err) {
                  callback(err);
                } else {
                  resourceData.url = parentResource.url + '/' + req.param('resourceName');
                  resourceData.parent = parentResource.id;
                  callback();
                }
              });
            },
            function createResource(callback){
              Resource.create(resourceData).exec(function(err,resource){
                if (err) {
                  callback(err);
                } else {
                  childID = resource.id;
                  var resourceDir = resource.url;
                  var filessystem = require('fs');
                  if (!filessystem.existsSync(resourceDir)) {
                    filessystem.mkdirSync(resourceDir);
                    callback();
                  }
                  console.log("+++ create resource +++ " + JSON.stringify(resource));
                  return res.json(resource);
                }
              });
            },
            function setChildren(callback){
                  Resource.findOne({id: parentID}).populate('children').exec(function(err,parentResource){
                    if(err) {
                      return res.json(err);
                    } else {
                      console.log();
                      console.log("*** childID *** " + childID);
                      parentResource.children.add(childID);
                      parentResource.save(function(err){
                        if (err) { return res.serverError(err); }
                        //return res.json(parentResource);
                      });
                    }
                    console.log();
                    console.log("*** parentResource *** " + JSON.stringify(parentResource));
                  });
                }
              ],
           function(err) {
             return res.json(err);
            }
          );
        }
      },

      getAll: function(req,res) {
        var projectName = req.param('projectName');
        var pID;
        // asyn.series(
        //   [
          //  function getProjectID(callback){
              Project.find({projectName: projectName, owner: req.user.id}).populateAll().exec(function(err, projects){
                if (err) {
                  return res.json(err);
                } else {
                  console.log();
                  console.log("*** all resources *** " + JSON.stringify(projects));
                  return res.json(projects);
                }
              });
        //     }
        //   ],
        //   function(err) {
        //     return res.json(err);
        // 	}
        // );
      }
};
