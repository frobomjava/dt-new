module.exports = {
  findUserById: function (userId, callback) {
    User.findOne({
      id: userId
    }).exec(function (err, user) {
      if (err) {
        return callback(err);
      }
      if (user) {
        return callback(null, user);
      }
      var error = {
        appMessage: 'No user exists with this id.'
      };
      return callback(error);
    });
  },

  findUserByEmail: function (email, callback) {
    User.findOne({
      email: email
    }).exec(function (err, user) {
      if (err) {
        return callback(err);
      }
      if (user) {
        return callback(null, user);
      }
      var error = {
        appMessage: 'No user exists with this email.'
      };
      return callback(error);
    });
  },

  findUserByUserName: function (userName, callback) {
    User.findOne({
      userName: userName
    }).exec(function (err, user) {
      if (err) {
        return callback(err);
      }
      if (user) {
        return callback(null, user);
      }
      var error = {
        message: 'No user exists with this user name'
      };
      return callback(error);
    });
  },

  retrieveAllUsers: function (callback) {
    User.find().exec(function (err, users) {
      if (err) {
        return callback(err);
      }
      return callback(null, users);
    });
  },

  createUser: function (user, callback) {
    User.create(user).exec(function (err, createdUser) {
      if (err) {
        return callback(err);
      }
      if (createdUser) {
        return callback(null, createdUser);
      }
      var error = {
        appMessage: "User could not be created"
      }
      return callback(error);
    });
  },

  userEmailExists: function (email, callback) {
    User.findOne({
      email: email
    }).exec(function (err, user) {
      if (err) {
        return callback(err);
      }
      if (!user) {
        return callback(null, false);
      }
      return callback(null, true);
    });
  },

  userNameExists: function (userName, callback) {
    User.findOne({
      userName: userName
    }).exec(function (err, user) {
      if (err) {
        return callback(err);
      }
      if (!user) {
        return callback(null, false);
      }
      callback(null, true);
    });
  },

  retrieveUsersByNameStartedWith: function (chars, callback) {
    User.find({
      userName: {
        startsWith: chars
      },
      sort: 'userName'
    }).exec(function (err, users) {
      if (err) {
        return callback(err);
      }
      return callback(null, users);
    });
  },

  validateUserCreation: function (userData, validationCallback) {
    var self = this;
    var validationMessages = null;
    async.series([
        function checkEmailExisting(callback) {
          self.userEmailExists(userData.email, function (err, exists) {
            if (err) {
              return callback(err);
            }
            if (exists) {
              validationMessages = validationMessages || {};
              validationMessages.emailExists = "Email already exists";
            }
            callback();
          });
        },
        function checkUserNameExisting(callback) {
          self.userNameExists(userData.userName, function (err, exists) {
            if (err) {
              return callback(err);
            }
            if (exists) {
              validationMessages = validationMessages || {};
              validationMessages.userNameExists = "User name already exists";
            }
            callback();
          })
        },
        function checkPasswordLength(callback) {
          if (userData.password.length < 6) {
            validationMessages = validationMessages || {};
            validationMessages.passwordLengthError = "Password must be at least 6 characters";
          }
          callback();
        },
        function checkPasswordsEqual(callback) {
          /* if (userData.password !== userData.confirmedPassword) {
               validationMessages = validationMessages || {};
               validationMessages.passwordNotMatch = "Passwords do not match";
           }*/
          callback();
        }
      ],
      function (err) {
        if (err) {
          return validationCallback(err);
        }

        if (validationMessages) {
          var error = {};
          error.validationErrorMessages = validationMessages;
          return validationCallback(error);
        }
        validationCallback(null, true);
      }
    );
  }
}
