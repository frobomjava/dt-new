/**
* Route Mappings
* (sails.config.routes)
*
* Your routes map URLs to views and controllers.
*
* If Sails receives a URL that doesn't match any of the routes below,
* it will check for matching files (images, scripts, stylesheets, etc.)
* in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
* might match an image file: `/assets/images/foo.jpg`
*
* Finally, if those don't match either, the default 404 handler is triggered.
* See `api/responses/notFound.js` to adjust your app's 404 logic.
*
* Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
* flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
* CoffeeScript for the front-end.
*
* For more information on configuring custom routes, check out:
* http://sailsjs.com/docs/concepts/routes/custom-routes
*/

module.exports.routes = {


  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': 'HomeController.welcome',

  'get /login': 'HomeController.welcome',

  'post /login': 'AuthController.login',

  '/logout': 'AuthController.logout',

  'get /signup': 'HomeController.signup',

  'post /signup': 'UserController.create',

  'get /users': 'UserController.getAll',

  'get /users/:userName': 'UserController.findUser',

  'get /projects': 'ProjectController.getAll',

  'post /project/new': 'ProjectController.create',

  'get /project/setting/:projectId': 'ProjectController.setting',

  'get /project/delete/:projectId': 'ProjectController.delete',

  'post /project/update': 'ProjectController.update',

  'get /project/in/:projectId': 'ProjectController.enter',

  'post /project/setting/:projectId/user/add/:userName': 'ProjectController.addMember',

  'get /project/setting/:projectId/user/remove/:userId': 'ProjectController.removeMember',

  'get /project/setting/:projectId/users': 'ProjectController.getMembers',

  'get /project/in/:projectId/files': 'DtFileController.getAll',

 'post /project/in/:projectId/file/new':'DtFileController.create',

  'post /project/in/:projectId/resource/new':'ResourceController.create',

  'get /project/in/:projectId/resources':'ResourceController.getAll',

  'get /project/in/:projectId/file/delete/:fileId':'DtFileController.delete',

  'post /project/in/:projectId/file/save': 'DtFileController.save',

  'get /project/in/:projectId/file/data/:fileId':'DtFileController.getData',

  'get /project/in/:projectId/resource/tree': 'ProjectController.resourceTree',

  'get /project/in/:projectId/resource/data/:resourceId':'ResourceController.getData'
};
