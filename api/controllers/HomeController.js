/**
* HomeController
*
* @description :: Server-side actions for handling incoming requests.
* @help        :: See http://sailsjs.com/docs/concepts/controllers
*/

module.exports = {

  welcome: function(req, res) {
    if (req.isAuthenticated()) {
      var redirectUrl = req.session.redirectTo ? req.session.redirectTo : '';
      delete req.session.redirectTo;
      if (redirectUrl != '') {
          res.redirect(redirectUrl);
      }
      else {
        res.view('welcome', {layout: null});
      }

    } else {
      res.view('signup', {layout: null, err:'', error: '', userName: ''});
    }
  },

  signup: function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/');
    } else {
      res.view('signup', {layout: null, err:'', error: '', userName: ''});
    }
  }

};
