function() {
  var w = $(this)
    , app = $$(w).app
    , username = $$("#account").userCtx.name
    , twebz = app.require("lib/twebz").init(app.db.name)
    , ready = false
    , readyFun = function() {
      app.db.openDoc(twebz.user_setup_docid(username), {
        success : function(doc) {
          if (!ready && doc.twebz.state == "setup-complete") {
            $("#items ul").unbind("_changes.readyFun");
            ready = true;
            w.trigger("_init");
          }
        }
      });
    };
  $("#items ul").bind("_changes.readyFun", function() {
    setTimeout(readyFun, 1000);
  });
}
