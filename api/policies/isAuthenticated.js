module.exports = function(req, res, next) {
  if (req.isSocket) {
    return next();
  } // to be fixed later
  if (req.isAuthenticated()) {
      return next();
  }
  else{
    req.session.redirectTo = req.url;
    console.log("req.session.redirectTo " + req.session.redirectTo);
    return res.redirect('/login');
  }
};
