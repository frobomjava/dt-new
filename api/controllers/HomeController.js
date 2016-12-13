/**
 * HomeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See http://sailsjs.com/docs/concepts/controllers
 */

module.exports = {

  welcome: function(req, res) {
    if (req.isAuthenticated()) {
      res.view('welcome');
    } else {
      res.view('homepage');
    }
  }

};
