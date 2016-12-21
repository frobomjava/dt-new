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
        Project.findOne({owner: req.user.id, projectName: projectData.projectName}).exec(function(err,projects){
          if (err) {
            callback(err);
          } else if (projects) {
            fileData.project = projects.id;
            callback();
          }
        });
      },

      function existDtFile(callback){
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
        var fileDir = process.cwd()+'\\projects\\' + req.user.userName +'\\'+ projectData.projectName + '\\' + fileData.fileName + '.json' ;
        fileData.url = fileDir;
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
                //console.log('---newFile--- ' + JSON.stringify(newFile));
                return res.json(newFile);
              }
            });
          }
        });
      }
    ],
    function(err) {
      return res.json(err);
    })
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
