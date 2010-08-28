function() {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    , security = app.require("lib/security")
    ;
  var cdb = $.couch.db(twebz.config_db);
  function setAccess() {
    security.addReaders(cdb, [twebz.app_user], function() {
      widget.trigger("ensure_twitter_keys");
    });
  };
  cdb.create({
    success : setAccess,
    error : setAccess
  });  
};