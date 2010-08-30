function() {
  // check to see that the user exists
  var widget = $(this)
  , username = $("[name=username]", widget).val()
  , app = $$(widget).app
  , twebz = app.require("lib/twebz").init(app.db.name)
  , security = app.require("lib/security")
  , info = $$("#account").info
  , udb = $.couch.db(twebz.user_db(username))
  ;
  function setSecret() {
    udb.saveDoc({
      _id : "twebz-secret",
      token : twebz.randomToken()
    }, {
      success : function() {
        widget.trigger("link_twitter_account");
      },
      error : function() {
        widget.trigger("link_twitter_account");
      }
    });
  };
  function setAccess() {
    security.addReaders(udb, [username, twebz.app_user], function() {
      udb.saveDoc({
        _id : "_design/twebz-private",
        views : app.ddoc["private"].views
      }, {
        success : setSecret,
        error : setSecret
      });
    });
  };
  $.couch.db(info.authentication_db).openDoc("org.couchdb.user:"+username, {
    success : function() {
      udb.create({
        success : setAccess,
        error : setAccess
      });
    },
    error : function() {
      widget.trigger("setup_user", [username]);
    }
  });
  return false;
};