function() {
  // check to see that the user exists
  var widget = $(this)
  , username = $("[name=username]", widget).val()
  , app = $$(widget).app
  , twebz = app.require("lib/twebz").init(app.db.name)
  , security = app.require("lib/security")
  , session = $$(widget.parents("div.tweet")).session
  ;
  $.couch.db(session.info.authentication_db).openDoc("org.couchdb.user:"+username, {
    success : function() {
      var udb = $.couch.db(twebz.user_db(username));
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
      udb.create({
        success : setAccess,
        error : setAccess
      });
    },
    error : function() {
      widget.trigger("setup_user", [username]);
    }
  });
  
  // create the user private db (grant access to twebz user)
  // setup hmac secret
  // trigger link twitter accts
  
  
  
  return false;
};