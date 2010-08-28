exports.init = function(dbname) {
  return {
    app_user : dbname,
    config_db : dbname + "-config",
    user_db : function(username) {
      return dbname + "-private-" + username;
    }
  }
};
