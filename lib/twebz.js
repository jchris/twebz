var sha1 = require("./sha1");

exports.init = function(dbname) {
  return {
    app_user : dbname,
    config_db : dbname + "-config",
    twitter_keys_docid : 'twitter-app-keys',
    secret_docid : "twebz-secret",
    profile_docid : function(twitter_user_id) {
      return dbname + "-twitter.user-" + twitter_user_id;
    },
    user_setup_docid : function(username) {
      return dbname + "-setup-" + username;
    },
    user_db : function(username) {
      return dbname + "-private-" + sha1.hex_sha1(username);
    },
    randomToken : function(uuid) {
      if (!uuid) {
        uuid = $.couch.newUUID();
      }
      return uuid.split("").sort(function() {
        return Math.random() - Math.random();
      }).join("");
    }
  }
};

exports.tweetli = function(doc) {
  var user = doc.user
    , message = doc.text
    , rt = false
    , error = false
    , linkup = require("vendor/couchapp/lib/linkup")
    , utils = require("vendor/couchapp/lib/utils")
    ;
  if (doc.twebz && doc.twebz.error && doc.twebz.error.error) {
    error = {desc : doc.twebz.error.error.data};
  }
  if (doc.retweeted_status) {
    rt = {
      image_url : user.profile_image_url,
      name : user.screen_name,
      nickname : user.name || user.screen_name      
    };
    user = doc.retweeted_status.user;
    message = doc.retweeted_status.text;
  }
  return {
    rt : rt,
    error : error,
    image_url : user.profile_image_url,
    name : user.screen_name,
    nickname : user.name || user.screen_name,
    message : linkup.encode(message, "#/user/", "#/search/"),
    pretty_date : utils.prettyDate(doc.created_at),
    created_at : doc.created_at,
    _id : doc._id
  };
};