function() {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    , f = $(this).serializeObject()
    , cdb = $.couch.db(twebz.config_db)
    ;
  f._id = "twitter-app-keys";
  cdb.saveDoc(f, {
    success : function() {
      widget.parents("div.tweet").trigger("setup_user")
    }
  })
  return false;
};