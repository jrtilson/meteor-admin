Meteor.publishComposite('adminCollectionDoc', function(collection, id) {
  var ref, ref1;
  check(collection, String);
  check(id, Match.OneOf(String, Mongo.ObjectID));
  if (Roles.userIsInRole(this.userId, [adminRole()])) {
    return {
      find: function() {
        return adminCollectionObject(collection).find(id);
      },
      children: (typeof AdminConfig !== "undefined" && AdminConfig !== null ? (ref = AdminConfig.collections) != null ? (ref1 = ref[collection]) != null ? ref1.children : void 0 : void 0 : void 0) || []
    };
  } else {
    return this.ready();
  }
});

Meteor.publish('adminUsers', function() {
  if (Roles.userIsInRole(this.userId, [adminRole()])) {
    return Meteor.users.find();
  } else {
    return this.ready();
  }
});

Meteor.publish('adminUser', function() {
  return Meteor.users.find(this.userId);
});

Meteor.publish('adminCollectionsCount', function() {
  var handles, self;
  handles = [];
  self = this;
  _.each(AdminTables, function(table, name) {
    var count, id, ready, selector;
    id = new Mongo.ObjectID;
    count = 0;
    table = AdminTables[name];
    ready = false;
    selector = table.selector ? table.selector(self.userId) : {};
    handles.push(table.collection.find().observeChanges({
      added: function() {
        count += 1;
        return ready && self.changed('adminCollectionsCount', id, {
          count: count
        });
      },
      removed: function() {
        count -= 1;
        return ready && self.changed('adminCollectionsCount', id, {
          count: count
        });
      }
    }));
    ready = true;
    return self.added('adminCollectionsCount', id, {
      collection: name,
      count: count
    });
  });
  self.onStop(function() {
    return _.each(handles, function(handle) {
      return handle.stop();
    });
  });
  return self.ready();
});

Meteor.publish(null, function() {
  return Meteor.roles.find({});
});

// ---
// generated by coffee-script 1.9.2