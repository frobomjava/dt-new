/**
* DtFileController
*
* @description :: Server-side actions for handling incoming requests.
* @help        :: See http://sailsjs.com/docs/concepts/controllers
*/
var jsonFile = require('jsonfile');

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

  },

  getData: function(req, res) {

  }

};
