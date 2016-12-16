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
        Project.findOne({owner: req.user.id, projectName: projectData.projectName}).exec(function(err, projects) {
          if (err) {
            callback(err);
          } else {
            DtFile.project = projects.id;
            projectData.id = projects.id;
            callback();
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

    var projectData = {
      projectName: req.param('projectName')
    };

    var fileData = {
      fileName: req.param('fileName')
    };

    var userId = req.user.id;

    async.series([
      function checkUser(callback) {
        User.findOne({id: userId}).exec(function(err,users){
          if(err){
            callback(err);
          } else if (users) {
            projectData.owner = users.id;
            callback();
          }
        });
      },

      function checkProject(callback) {
        Project.findOne({owner: projectData.owner , projectName: projectData.projectName}).exec(function(err,projects){
          if (err) {
            callback(err);
          } else if (projects) {
            fileData.project = projects.id;
            callback();
          }
        });
      },

      function createDtFile(callback){
        var fileDir = process.cwd()+'\\projects\\' + req.user.userName +'\\'+ projectData.projectName + '\\' + fileData.fileName + '.json' ;
        fileData.url = fileDir ;
        console.log("---File Url--- = " + fileDir);
        var obj = {
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

        jsonFile.writeFile(fileDir, obj, function(err){
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
      return res.serverError(err);
    })
  },

  delete: function(req, res) {

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
    var projectData = {
      projectName: req.param('projectName')
    };

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
          console.log("J Data = " + JSON.stringify(dtFileJSONData));
          return res.json(dtFileJSONData);
        })
      }
    });
  }
};
