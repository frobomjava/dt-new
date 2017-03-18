/**
 * Activity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    project: {
      model: 'project'
    },

    user: {
      model: 'user'
    },

    action: {
      type: 'string',
      enum: ['created', 'deleted', 'updated']
    },

    resource: {
      model: 'resource'
    },

    date: {
      type: 'datetime'
    }

  }
};
