/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See http://sailsjs.com/docs/concepts/controllers
 */
var UserUtil = require('../utils/UserUtil.js');
module.exports = {
  getAll: function (req, res) {
    UserUtil.retrieveAllUsers(function (err, users) {
      if (err) {
        return res.serverError(err);
      }
      return res.json(users);
    });
  },

  findUser: function (req, res) {
    UserUtil.retrieveUsersByNameStartedWith(req.param('userName'),
      function (err, users) {
        if (err) {
          return res.json(err);
        }
        return res.json(users);
      });
  },

  create: function (req, res) {
    var userData = {
      email: req.param('email'),
      userName: req.param('userName'),
      password: req.param('password')
    };

    async.series([
        function validate(callback) {
          UserUtil.validateUserCreation(userData, function (err, canCreate) {
            if (err) {
              return callback(err);
            }
            if (canCreate) {
              return callback();
            }
          });
        },

        function create(callback) {
          UserUtil.createUser(userData, function (err, createdUser) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        }
      ],
      function done(err) {
        if (err) {
          return res.render("signup", {
            layout: null,
            error: 'Error occured',
            err: '',
            userName: ''
          });
        }

        return res.render("signup", {
          layout: null,
          error: '',
          err: '',
          userName: userData.userName
        });
      });

  }
};
