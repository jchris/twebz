function() {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    ;
  // ensure the twebz user exists and has a private database for config
  $.couch.session({
    success : function(session) {
      $.couch.db(session.authentication_db).openDoc("org.couchdb.user:"+twebz.app_user, {
        success : function() {
          // if the user exists, we assume it's been setup proper
          // check to see if the config database exists
        },
        error : function() {
          if (session.userCtx.roles.indexOf("_admin") != -1) {
            widget.trigger("create_app_user");
          } else {
            widget.trigger("admin_required");
          }
        }
      });
    }
  })
  // 
  // app.db.openDoc("twebz-config", {
  //   success : function(doc) {
  //     if (doc.twebz) {
  //       widget.trigger("keyring");
  //     } else {
  //       widget.trigger("twitter_keypair");
  //     }
  //   },
  //   error : function() {
  //     widget.trigger("twitter_keypair");
  //   }
  // });
};