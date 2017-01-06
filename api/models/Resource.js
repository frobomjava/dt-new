/**
 * Resource.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
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
