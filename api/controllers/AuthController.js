/**
* AuthController
*
* @description :: Server-side actions for handling incoming requests.
* @help        :: See http://sailsjs.com/docs/concepts/controllers
*/
var passport = require('passport');

module.exports = {
  login: function(req, res) {
    passport.authenticate('local', function(err, user, info) {
      if ((err) || (!user)) {
        return res.send({
          message: info.message,
          user: user
        });
      }
      req.logIn(user, function(err) {
        if (err) {
          console.log(err);
          return res.send(err);
        }
        return res.redirect('/');
      });

    })(req, res);
  },

  logout: function(req, res) {
    req.logout();
    res.redirect('/');
  }

};
