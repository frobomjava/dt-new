/**
 * ActivityController
 *
 * @description :: Server-side logic for managing activities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var ProjectUtil = require('../utils/ProjectUtil.js');
var ResourceUtil = require('../utils/ResourceUtil.js');
var ActivityUtil = require('../utils/ActivityUtil.js');
var UserUtil = require('../utils/UserUtil.js');
module.exports = {

  /**
   * `ActivityController.create()`
   */
  create: function (req, res) {
		console.log('#### ActivityController create action ####');

		var activityData = req.param('data');
    var projectData = { id: activityData.project };
		console.log('got activityData : ' + JSON.stringify(activityData));

		async.series([
			function findProject(callback){
				ProjectUtil.findProject(projectData, function (err, project) {
					if (err) {
						return callback(err);
					}
					if (project) {
            delete project.updatedAt;
            delete project.createdAt;
						activityData.project = project;
					}
					callback();
				})
			},
      function findUser(callback){
        UserUtil.findUserById(activityData.user, function (err, user){
          if (err) {
            return callback(err);
          }
          delete user.updatedAt;
          delete user.createdAt;
          activityData.user = user;
          callback();
        })
			},
			function createActivity(callback){
				ActivityUtil.createActivity(activityData, function (err, activity) {
					if (err) {
						return callback(err);
					}
					if (activity) {
						console.log('***** activity is created *****');
            activityData.id = activity.id;
            console.log('*** activityData before broadcast: ' + JSON.stringify(activityData));
            sails.sockets.broadcast(projectData.id, 'new-activity', activityData, req);
            return res.ok();
						//return res.json(activityData);
					}
				});
			}
		],
		function(err) {
			if (err) {
				return res.serverError(err);
			}
		}
		);
  },

	getData: function (req, res) {
		var projectId = req.param('projectId');

		async.waterfall(
		[
			function findActivities(callback){
				ActivityUtil.findActivitiesByProjectId(projectId, function (err, activities) {
					if (err) {
						return res.serverError(err);
					}
          console.log('=== findActivities ===');
					console.log('activities : ' + JSON.stringify(activities));
					callback(null, activities);
					//return res.json(activities);
				});
			},
			function addUser(activities, callback){
        async.each(activities,
          function(activity, callback){
            console.log('activity.user : ' + activity.user);
            UserUtil.findUserById(activity.user, function (err, user){
              if (err) {
                return callback(err);
              }

              activity.user = user;
              delete activity.updatedAt;
              delete activity.createdAt;
              callback();
            });
          },

          function(err){
            if (err) {
              return callback(err);
            }
            //console.log('activities after addUser : ' + JSON.stringify(activities));
            return callback(null, activities);
          }
        );
			},
      function addResource(activities, callback) {
        async.each(activities,
          function(activity, callback){
            ResourceUtil.findResourceById(activity.resource, function (err, resource){
              if (err) {
                return callback(err);
              }

              activity.resource = resource;
              callback();
            });
          },
          function(err){
            if (err) {
              return callback(err);
            }
            //console.log('activities after addResource : ' + JSON.stringify(activities));
            return callback(null, activities);
          }
        );
      }
		],
		function (err, activities) {
			if (err) {
				return res.serverError(err);
			}
      console.log('activities before send : ' + JSON.stringify(activities));
			return res.json(activities);
		});
  },


};
