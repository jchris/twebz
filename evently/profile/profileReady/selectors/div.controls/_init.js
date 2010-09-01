function() {
  var widget = $(this)
    , app = $$(widget).app
    ;
  // setup app, then user
  app.db.openDoc("twebz-status",{
    success : function(doc) {
      if (doc.state == "setup-complete") {
        widget.trigger("setup_user");
      } else {
        widget.trigger("setup_app");
      }
    },
    error : function() {
      widget.trigger("setup_app");
    }
  });
};