exports.addReaders = function(db, users, cb) {
  db.getDbProperty("_security", {
    success : function(secObj) {
      secObj.readers = secObj.readers || {
        names : [],
        roles : []
      };
      var user, changed = false;
      for (var i=0; i < users.length; i++) {
        user = users[i]
        if (secObj.readers.names.indexOf(user) == -1) {
          secObj.readers.names.push(user);
          changed = true;
        }
      };
      if (changed) {
        db.setDbProperty("_security", secObj, {
          success : cb
        });
      } else {
        cb();
      }
    }
  });
};