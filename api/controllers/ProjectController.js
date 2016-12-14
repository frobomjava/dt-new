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
        return res.json(data);
      }
    });
  },

  getAll: function(req, res) {
			Project.find({owner: req.user.id}).exec(function(err, data) {
				if (err) {
          console.log(JSON.stringify((err)));
          return res.json(err);
				} else {
          console.log(JSON.stringify(data));
					return res.json(data);
				}
			});
  },

  delete: function(req, res) {

  },

  update: function(req, res) {

  },

  enter: function(req, res) {

  }


};
