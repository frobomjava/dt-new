/**
* Policy Mappings
* (sails.config.policies)
*
* Policies are simple functions which run **before** your controllers.
* You can apply one or more policies to a given controller, or protect
* its actions individually.
*
* Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
* below by its filename, minus the extension, (e.g. "authenticated")
*
* For more information on configuring policies, check out:
* http://sailsjs.com/config/policies
*
* Or for more about how policies work in general, see:
* http://sailsjs.com/docs/concepts/policies
*/


module.exports.policies = {

  '*': true,

  'PostController': {
    '*': 'isAuthenticated'
  },

  'ProjectController': {
    '*': 'isAuthenticated',
    'resourceTree': ['isAuthenticated', 'projectAuth'],
    'delete': ['isAuthenticated', 'projectAuth'],
    'update': ['isAuthenticated', 'projectAuth'],
    'enter': ['isAuthenticated', 'projectAuth'],
    'setting': ['isAuthenticated', 'projectAuth'],
    'addMember': ['isAuthenticated', 'projectAuth'],
    'getMembers': ['isAuthenticated', 'projectAuth'],
    'removeMember': ['isAuthenticated', 'projectAuth']

  },

  'DtFileController': {
    '*': 'isAuthenticated'
  }

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/
  // RabbitController: {

  // Apply the `false` policy as the default for all of RabbitController's actions
  // (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
  // '*': false,

  // For the action `nurture`, apply the 'isRabbitMother' policy
  // (this overrides `false` above)
  // nurture  : 'isRabbitMother',

  // Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
  // before letting any users feed our rabbits
  // feed : ['isNiceToAnimals', 'hasRabbitFood']
  // }
};
