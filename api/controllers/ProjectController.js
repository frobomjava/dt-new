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
    Project.create({projectName: projectName, owner: req.user.id}).exec(function(err, data){
      if (err) {
        console.log(JSON.stringify((err)));
        return res.json(err);
      } else {
        console.log(data.projectName);
        return res.json({name: data.projectName});
      }
    });
  },

  getAll: function(req, res) {
    var data = {
      projects: [
        {
          name: 'project1'
        },
        {
          name: 'project2'
        },
        {
          name: 'project3'
        }
      ]
    };

    return res.json(data);
  },

  delete: function(req, res) {

  },

  update: function(req, res) {

  },

  enter: function(req, res) {

  }


};
