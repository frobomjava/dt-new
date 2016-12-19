/**
* UserController
*
* @description :: Server-side actions for handling incoming requests.
* @help        :: See http://sailsjs.com/docs/concepts/controllers
*/

module.exports = {
  create: function(req, res) {
    if (req.param('password').length < 6) {
      return res.render("signup", {layout:null, error: 'Password must be at least 6 characters!'});
    }
    var message;
    async.series([
      function findUserName(callback) {
        User.findOne({email: req.param('email')}).exec(function(err, user) {
          if (err) {
            callback(err);
          } else if (user) {
            message = user.email + ' already exist!';
            callback();
          }
          else {
            callback();
          }
        });
      },
      function findUserEmail(callback) {
        User.findOne({userName: req.param('userName')}).exec(function(err, user) {
          if (err) {
            callback(err);
          } else if (user) {
            message += '\n' + user.userName + ' already exist!';
            callback(message);
          }
          else {
            callback();
          }
        });
      },
      function createUser(callback) {
        User.create({
          email: req.param('email'),
          userName: req.param('userName'),
          password: req.param('password')
        }).exec(function(err, user) {
          if (err) {
            callback(err);
          }
          else {
            res.redirect('/login');
          }
        });
      }
    ],
    function(err) {
      console.log('err : ' + err);
      return res.render("signup", {layout:null, error: message});
    });

  }
};
