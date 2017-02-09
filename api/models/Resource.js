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
    },

    toJSON: function () {
    var resource = this.toObject();
    if (this.children && this.children.length > 0) {
      var newChildren = this.children.map(function (child) {
        delete child.createdAt;
        delete child.createdBy;
        delete child.updatedAt;
        return child;
      });
      resource.children = newChildren;
    }
    delete resource.createdAt;
    delete resource.createdBy;
    delete resource.updatedAt;
    return resource;
  }

  },

  fillChildResourcesRecursively: function (resource) {
    Resource.find({ parent: resource.id }).exec(function (err, resources) {
      if (err) {
        console.log("Error occured");
      } else if (resources) {
        resource.children = resources;
        resources.forEach(function (childResource) {
          console.log("In forEach loop in recursive function");
          console.log("Child:" + childResource.name + " Parent:" + resource.name);
          Resource.fillChildResourcesRecursively(childResource);
        });
      }
    });
  },

  fillChildResourcesRecursively2: function (remainingCount, resources, callback) {
    console.log("recursive calling");
    if (remainingCount == 0) {
      callback();
    }

    if (resources && resources.length > 0) {
      resources.forEach(function (resource) {
        console.log(resource.name);
        remainingCount--;
        Resource.find({ parent: resource.id }).exec(function (err, resources) {
          if (err) {
            console.log("Error occured");
          } else if (resources) {
            resource['children'] = resources;
            remainingCount = remainingCount + resources.length;
            Resource.fillChildResourcesRecursively2(remainingCount, resources, callback);
          }

        });
      });
    }

  },

  toJSON: function () {
    console.log("toJSON was called in Resource class");
    var resource = this.toObject();
    if (this.children && this.children.length > 0) {
      console.log("has children property in toJSON function****************");
      var newChildren = this.children.map(function (child) {
        return child.toJSON();
      });
      resource.children = newChildren;
    }
    resource.toJSON = null;
    delete resource.url;
    delete resource.createdAt;
    delete resource.createdBy;
    return resource;
  }
};

