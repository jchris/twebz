exports.init = function(dbname) {
  return {
    app_user : dbname,
    config_db : dbname + "-config",
    twitter_keys_docid : 'twitter-app-keys',
    user_setup_docid : function(username) {
      return dbname + "-setup-" + username;
    },
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
