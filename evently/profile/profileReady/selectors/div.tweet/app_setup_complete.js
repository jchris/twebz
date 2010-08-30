function() {
  var widget = $(this)
    , app = $$(widget).app
    ;
  function goInit() {
    widget.trigger("_init");
  }
  app.db.saveDoc({
    _id : "twebz-status",
    state : "setup-complete"
  }, {
    success : goInit,
    error : goInit
  });
};
