function applyReaders(secObj, users, logged) {
  secObj.readers = secObj.readers || {
    names : [],
    roles : []
  };
  var user;
  for (var i=0; i < users.length; i++) {
    user = users[i]
    if (secObj.readers.names.indexOf(user) == -1) {
      secObj.readers.names.push(user);
      if (logged) logged.changed = true;
    }
  };
  return secObj;
}

exports.applyReaders = applyReaders;

exports.addReaders = function(db, users, cb) {
  db.getDbProperty("_security", {
    success : function(secObj) {
      var l = {};
      secObj = applyReaders(secObj, users, l);
      if (l.changed) {
        db.setDbProperty("_security", secObj, {
          success : cb
        });
      } else {
        cb();
      }
    }
  });
};