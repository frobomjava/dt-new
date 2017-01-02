/**
* Project.js
*
* @description :: A model definition.  Represents a database table/collection/etc.
* @docs        :: http://sailsjs.com/docs/concepts/models-and-orm/models
*/

module.exports = {

  attributes: {

    projectName: {
      type: 'string',
      required: true
    },

    url: {
      type: 'string'
    },

    owner:{
      model: 'user'
    },

    members: {
      collection: 'user'
    },

    resources: {
      collection: 'resource'
    },

    createdAt: {
      type: 'number',
      autoCreatedAt: true
    },

    updatedAt: {
      type: 'number',
      autoUpdatedAt: true
    }

  }

};
