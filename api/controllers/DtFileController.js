/**
* DtFileController
*
* @description :: Server-side actions for handling incoming requests.
* @help        :: See http://sailsjs.com/docs/concepts/controllers
*/
var jsonFile = require('jsonfile');
var fs = require('fs');

module.exports = {

  getAll: function(req, res) {

    var projectData = {
      projectName: req.param('projectName')
    };

    async.series([
      function findProject(callback) {
        Project.find({projectName: projectData.projectName}).populate('members').exec(function(err, projects) {
          if (err) {
            callback(err);
          } else {
            projects.forEach(function(project) {
              if (project.owner == req.user.id) {
                projectData.id = project.id;
                callback();
              }
              else {
                console.log();
                console.log('members ' + JSON.stringify(project.members));

                var memberProject = project.members.filter(function(member){
                  return member.id == req.user.id;
                });
                if (memberProject.length > 0) {
                  projectData.id = project.id;
                  callback();
                }
              }
            });


          }
        });
      },

      function findDtFile(callback){
        DtFile.find({project: projectData.id}).exec(function(err,data){
          if(err) {
            callback(err);
          } else {
            //console.log("----FileDatas------" + JSON.stringify(data));
            return res.json(data);
          }
        });
      }
    ],
    function(err) {
      return res.serverError(err);
    })
  },

  create: function(req, res) {
    console.log("===============");
    console.log("===== file create ====");

    var projectData = {
      projectName: req.param('projectName')
    };

    var fileData = {
      fileName: req.param('fileName')
    };

    async.series([
      function findProject(callback) {
        Project.find({projectName: projectData.projectName}).populate('members').exec(function(err, projects) {
          if (err) {
            callback(err);
          } else {
            for (var i = 0; i < projects.length; i++) {
              if (projects[i].owner == req.user.id) {
                fileData.project = projects[i].id;
                projectData.owner = projects[i].owner;
                break;
              }
              else {
                console.log();
                console.log('members ' + JSON.stringify(projects[i].members));

                var memberProject = projects[i].members.filter(function(member){
                  console.log('member.id :' + member.id);
                  console.log('user.id : ' + req.user.id);
                  return member.id == req.user.id;
                });
                console.log(memberProject.length);
                if (memberProject.length > 0) {
                  fileData.project = projects[i].id;
                  console.log('projects[i].owner : ' + JSON.stringify(projects[i].owner));
                  projectData.owner = projects[i].owner;
                  console.log('project.id : ' + projects[i].id);
                  console.log('fileData.project : ' + fileData.project);

                  break;
                }
              }
            }
            callback();
          }
        });
      },

      function existDtFile(callback){
        console.log('===existDtFile===');
        DtFile.findOne({fileName: fileData.fileName, project:fileData.project}).exec(function(err, data){
          if (err) {
            console.log(JSON.stringify((err)));
            return res.json(err);
          } else if(data){
            var message = fileData.fileName + ' is already exist..';
            console.log(message);
            return res.json(err);
          }
          else {
            callback();
          }
        });
      },

      function createDtFile(callback){
        console.log('===createDtFile===');

        async.series(
      	[
      		function getProjectOwner(callback){
            Project.findOne(fileData.project).populate('owner')
            .exec(function(err, project) {

              if (err) {callback(err);}
              console.log(project.owner.userName);
              fileData.ownerName = project.owner.userName;
              callback();
            });
      		},

      		function createFile(callback){
            var fileDir = process.cwd()+'/projects/' + fileData.ownerName +'/'
                + projectData.projectName + '/' + fileData.fileName + '.json' ;
            fileData.url = fileDir;
            console.log('fileData.url : ' + fileData.url);
            var dtFileJSONData = {
              names:{
                conditions : [""],
                actions : [""]
              },

              rules:[
                {
                  conditions : [""],
                  actions : [""]
                },
              ]
            }

            jsonFile.writeFile(fileDir, dtFileJSONData, function(err){
              if(err){
                callback(err);
              } else {
                DtFile.create(fileData).exec(function(err,newFile){
                  if(err){
                    callback(err);
                  } else {
                    console.log('---newFile--- ' + JSON.stringify(newFile));
                    return res.json(newFile);
                  }
                });
              }
            });
      		}
      	],
        function(err) {
          console.log('err : ' + err);
          return res.json(err);
        });
      }
    ],
    function(err) {
      console.log('err : ' + err);
      return res.json(err);
    });
  },

  delete: function(req, res) {
    console.log("========================");
    console.log("===server file delete===");

    var fileData = {
      fileId: req.param('fileId')
    }

    async.series([
      function findDtFile(callback){
        DtFile.findOne({id: fileData.fileId}).exec(function(err,dtFile){
          if (err) {
            callback(err);
          } else {
            fileData.url = dtFile.url;
            fs.unlink(fileData.url, function(err) {
              if (err) callback(err);
              console.log("===file deleted successfully from directory===");
            });
            callback();
          }
        })
      },

      function deleteDtFile(callback){
        DtFile.destroy({id: fileData.fileId}).exec(function(err){
          if (err) {
            callback(err);
          } else {
            console.log("===file delete ok from model===");
            res.ok();
          }
        });
      }
    ],
    function(err) {
      return res.json(err);
    })

  },

  save: function(req, res) {

    var fileUrl, fileName;

    var fileData = {
      fileId: req.param('fileId')
    }
    var dtFileJSONData = req.param('dtData');

    DtFile.findOne({id: fileData.fileId}).exec(function(err,dtFile){
      if (err) {
        return res.serverError(err);
      } else {
        fileUrl = dtFile.url;
        fileName = dtFile.fileName;

        fs.writeFile(fileUrl,JSON.stringify(dtFileJSONData), function (err) {
          if (err) return console.log("===Error=== " + err);
        });
        return res.ok();
      }
    });
  },

  getData: function(req, res) {
    console.log("---getData---");

    var fileData = {
      id: req.param('fileId')
    };

    DtFile.findOne({id: fileData.id}).exec(function(err,dtFiles){
      if(err) {
        return res.serverError(err);
      } else {
        var path = dtFiles.url;
        console.log("---path--- " + path);
        jsonFile.readFile(path, function(err, dtFileJSONData) {

          return res.json(dtFileJSONData);
        })
      }
    });
  }
};
