/**
* DtFile.js
*
* @description :: A model definition.  Represents a database table/collection/etc.
* @docs        :: http://sailsjs.com/docs/concepts/models-and-orm/models
*/

module.exports = {

  attributes: {

    fileName: {
      type: 'string',
      required: true
    },

    url: {
      type: 'string'
    },

    project: {
      model: 'project'
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
