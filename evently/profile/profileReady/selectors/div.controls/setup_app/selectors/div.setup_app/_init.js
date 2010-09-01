function() {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    , info = $$("#account").info
    , userCtx = $$("#account").userCtx
    ;
  // ensure the twebz user exists and has a private database for config
  $.couch.db(info.authentication_db).openDoc("org.couchdb.user:"+twebz.app_user, {
    success : function() {
      widget.trigger("setup_config_db");
    },
    error : function() {
      if (userCtx.roles.indexOf("_admin") != -1) {
        widget.trigger("create_app_user");
      } else {
        widget.trigger("admin_required");
      }
    }
  });
  return false;
};