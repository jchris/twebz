exports.init = function(dbname) {
  return {
    app_user : dbname,
    config_db : dbname + "-config",
    user_db : function(username) {
      return dbname + "-private-" + username;
    },
    randomToken : function() {
      return $.couch.newUUID().split("").sort(function() {
        return Math.random() - Math.random();
      }).join("");
    }
  }
};
