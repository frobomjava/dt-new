/**
* ProjectController
*
* @description :: Server-side actions for handling incoming requests.
* @help        :: See http://sailsjs.com/docs/concepts/controllers
*/

module.exports = {

  create: function(req, res) {

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
