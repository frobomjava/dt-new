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

    var url = process.cwd() + '/projects' + '/' + req.user.userName+'/' + projectData.projectName + '/' + req.param('resourceName') ; //to redo

    var parentID = req.param('nodeID');
    console.log("== parentID == " + parentID);

    var resourceData = {
      name: req.param('resourceName'),
      url: url,
      resourceType: req.param('resourceType'),
      createdBy: req.user.id
    }

    if(!parentID){
      console.log("Parent is not exist.");
      Resource.create(resourceData).exec(function(err, data){
        if (err) {
          return res.json(err);
        } else {
          Project.findOne({projectName:projectData.projectName}).populate('resources').exec(function (err, project){
            if (err) { return res.serverError(err); }
            if (!project) { return res.notFound('Could not find a project.'); }
            project.resources.add(data);
            project.save(function(err){
              if (err) { return res.serverError(err); }
              return res.json(data);
            });
          });
        }
      });
    } else {
      console.log("Parent is exist.");
      Resource.create(resourceData).exec(function(err,resource){
        if(err){
          return res.json(err);
        } else {
          Resource.findOne({id: parentID}).populate('children').exec(function(err,parentResource){
            if(err) {
              return res.json(err);
            } else {
              console.log("==parentResource== " + JSON.stringify(parentResource));
              resource.parent = parentResource;
              parentResource.children.add(resource);
              parentResource.save(function(err){
                if (err) { return res.serverError(err); }
                return res.json(resource);
              });
            }
          });
        }
      });
    }
  }
};
