/**
 * Resource.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: http://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    url: {
      type: 'string'
    },
    
    resourceType: {
      type: 'string',
      enum: ['folder', 'file']
    },

    parent: {
      model: 'resource'
    },

    children: {
      collection: 'resource'
    },
   
    createdBy: {
      model: 'user'
    },

    level: {
      type: 'integer'
    },
    
    extension: {
      type: 'string'
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

