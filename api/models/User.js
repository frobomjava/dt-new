/**
* User.js
*
* @description :: A model definition.  Represents a database table/collection/etc.
* @docs        :: http://sailsjs.com/docs/concepts/models-and-orm/models
*/

module.exports = {

  attributes: {

    email: {
      type: 'email',
      required: true,
      unique: true
    },

    userName: {
      type: 'string',
      required: true,
      unique: true
    },

    password: {
      type: 'string',
      minLength: 6,
      required: true
    },

    createdAt: {
      type: 'number',
      autoCreatedAt: true
    },

    updatedAt: {
      type: 'number',
      autoUpdatedAt: true
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }

  },

  beforeCreate: function(user, cb) {
    var bcrypt = require('bcryptjs');
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          console.log(err);
          cb(err);
        } else {
          user.password = hash;
          cb();
        }
      });
    });
  },

};
