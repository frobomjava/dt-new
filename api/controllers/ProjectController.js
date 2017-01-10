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
    var data = {
      projects : [],
      memberProjects : [],
      userName : ""
    };
    async.series(
  	[
  		function getOwnProjects(callback){
        Project.find({owner: req.user.id}).exec(function(err, projects) {
          if (err) {
            console.log(JSON.stringify((err)));
            callback(err);
          } else {
            console.log();
            console.log('---own projects---');
            console.log(JSON.stringify(projects));
            data.projects = projects;
            callback();
          }
        });
  		},
  		function getMemberProjects(callback){
        Project.find().populate('members').exec(function(err, projects) {
          if (err) {
            console.log(JSON.stringify(err));
            callback(err);
          } else {
            var memberProjects = projects.filter(function(project){
              var result = project.members.filter(function(member){
                return member.id == req.user.id;
              });
              return result.length > 0; //&& project.owner != req.user.id;
            });
            console.log();
            console.log('---memberProjects---');
            memberProjects.forEach(function(mp) {
              console.log(mp);
            });

            // return res.json(memberProjects);
            data.memberProjects = memberProjects;
            data.userName = req.user.userName;
            console.log();
            console.log('---data---');
            console.log(JSON.stringify(data));

            return res.json(data);
          }
        });
  		}
  	],
  	function(err) {
      return res.json(err);
  	}
  );

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
    return res.view('workspace', {layout: null, projectName: req.param('projectName'), ownerOrmember: req.param('ownerOrmember')});
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
    .exec(function(err, project) {
      if(err) { return res.json(err); }

      return res.json(project.members);
    });
  },

  removeMember: function(req, res){
    console.log();
    console.log('---removeMember---');
    console.log('userId ' + req.param('userId'));
    console.log();

  async.series(
  	[
  		function remove(callback){
        Project.findOne({projectName: req.param('projectName')})
        .populate('members')
        .exec(function(err, project){
          if(err) { callback(err); }
          project.members.remove(req.param('userId'));

          project.save(function(err){
            if (err) { callback(err); }

            callback();
          });

        });
  		},

  		function sendUpdatedMembers(callback){
        console.log();
        console.log('----sendUpdatedMembers-----');

        Project.findOne({projectName: req.param('projectName')})
        .populate('members', { sort: 'userName ASC' })
        .exec(function(err, project) {
          if(err) { callback(err); }
          console.log();
          console.log('3. before send JSON ' + JSON.stringify(project.members));
          return res.json(project.members);
        });
  		}
  	],
  	function(err) {
      console.log();
      console.log('err : ' + err);
      return res.json(err);
  	}
  );
}

};
