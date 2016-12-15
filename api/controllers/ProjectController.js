/**
* ProjectController
*
* @description :: Server-side actions for handling incoming requests.
* @help        :: See http://sailsjs.com/docs/concepts/controllers
*/

module.exports = {

  create: function(req, res) {
    var projectName = req.param('projectName');
    console.log(projectName);

    Project.findOne({projectName: projectName, owner: req.user.id}).exec(function(err, data){
      if (err) {
        console.log(JSON.stringify((err)));
        return res.json(err);
      } else if(data){
        var message = data.projectName + ' is already exist..';
        console.log(message);
        return res.json({error: message});
      }
      else {
        Project.create({projectName: projectName, owner: req.user.id}).exec(function(err, data){
          if (err) {
            console.log(JSON.stringify((err)));
            return res.json(err);
          } else {
            var projectdir = process.cwd()+'\\projects';

            var filessystem = require('fs');
            if (!filessystem.existsSync(projectdir)) {
              filessystem.mkdirSync(projectdir);
            }

            projectdir += '\\' + req.user.userName;
            if (!filessystem.existsSync(projectdir)) {
              filessystem.mkdirSync(projectdir);
            }

            projectdir += '\\' + data.projectName;
            if (!filessystem.existsSync(projectdir)) {
              filessystem.mkdirSync(projectdir);
            }

            console.log(projectdir + " Directory created successfully!");
            console.log(data.projectName);
            return res.json(data);
          }
        });
      }
    });
  },

  getAll: function(req, res) {
    Project.find({owner: req.user.id}).exec(function(err, data) {
      if (err) {
        console.log(JSON.stringify((err)));
        return res.json(err);
      } else {
        //console.log(JSON.stringify(data));
        return res.json(data);
      }
    });
  },

  delete: function(req, res) {
    var userId = req.user.id;
    var projectName = req.param('projectName');
    console.log("---delete project name--- " + projectName);
    Project.destroy({owner: userId , projectName : projectName}).exec(function(err){
      if (err) {
        console.log(JSON.stringify(err));
        return res.json(err);
      }
      res.ok();
    });

  },

  update: function(req, res) {

  },

  enter: function(req, res) {
    console.log("---enter workspace---");
    return res.view('workspace', {layout: null, projectName: req.param('projectName')});
  }


};
