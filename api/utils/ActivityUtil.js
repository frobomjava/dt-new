var UserUtil = require('../utils/UserUtil.js');
module.exports = {
  createActivity: function (activityData, callback) {
    Activity.create(activityData).exec(function (err, createdActivity) {
      if (err) {
        return callback(err);
      }
      if (createdActivity) {
        return callback(null, createdActivity);
      }
      var error = {
        appMessage: "Activity could not be created."
      };
      return callback(error);
    });
  },

  findActivitiesByProjectId: function (projectId, callback) {
    Activity.find({
      project: projectId
    }).exec(function (err, activities) {
      if (err) {
        return callback(err);
      }
      if (activities) {
        return callback(null, activities);
      }
      var error = {
        appMessage: 'Activites not found'
      };
      return callback(error);
    });
  }
}
