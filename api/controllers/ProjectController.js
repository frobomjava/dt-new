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
        var url = process.cwd()+'/projects'+'/' + req.user.userName+'/' + projectName;
        Project.create({projectName: projectName, url: url, owner: req.user.id}).exec(function(err, data){
          if (err) {
            console.log(JSON.stringify((err)));
            return res.json(err);
          } else {
            var projectdir = process.cwd()+'/projects';

            var filessystem = require('fs');
            if (!filessystem.existsSync(projectdir)) {
              filessystem.mkdirSync(projectdir);
            }

            projectdir += '/' + req.user.userName;
            if (!filessystem.existsSync(projectdir)) {
              filessystem.mkdirSync(projectdir);
            }

            projectdir += '/' + data.projectName;
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
  },

  setting: function(req, res) {
    console.log("---enter setting---");
    return res.view('setting', {layout: null, projectName: req.param('projectName')});
  },

  addMember: function(req, res) {
    console.log('---add member---');
    Project.findOne({projectName: req.param('projectName')}).populate('members').exec(function (err, project){
      if (err) { return res.serverError(err); }
      if (!project) { return res.notFound('Could not find a project! '); }

      User.findOne({userName: req.param('userName')}).exec(function (err, user){
        if (err) { return res.serverError(err); }
        if (!user) { return res.notFound('Could not find a user!'); }

        project.members.add(user.id);
        project.save(function(err){
          if (err) { return res.serverError(err); }
          return res.json(user);
        });//</save()>
      });//</User.findOne()>
    });//</Project.findOne()>
  },

  getMember: function(req, res) {
    console.log('---getMember---');
    Project.findOne({projectName: req.param('projectName')})
    .populate('members', { sort: 'userName ASC' })
    .exec(function(err, user) {
      if(err) { return res.json(err); }

      console.log(user);
      return res.json(user.members);
    });
  }

};
