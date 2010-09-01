function(cb) {
  var widget = $(this)
  , app = $$(widget).app
  , userCtx = $$("#account").userCtx
  , twebz = app.require("lib/twebz").init(app.db.name)
  , udb = $.couch.db(twebz.user_db(userCtx.name))
  ;
  udb.view("twebz-private/twitter-accts", {
    success : cb
  });
};