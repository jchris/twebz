function() {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    , f = $(this).serializeObject()
    , cdb = $.couch.db(twebz.config_db)
    ;
  // if keys are set, setup current user
  cdb.openDoc("twitter-app-keys", {
    success : function() {
      widget.trigger("setup_user");
    },
    error : function() {
      widget.trigger("twitter_keypair");
    }
  })
}