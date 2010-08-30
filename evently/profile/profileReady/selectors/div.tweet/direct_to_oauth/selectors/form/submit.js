function(e) {
  var doc = e.data.args[1]
    , widget = $(this)
    , app = $$(widget).app
    , pin = $("[name=pin]", widget).val()
    , twebz = app.require("lib/twebz").init(app.db.name)
    , username = $$("#account").userCtx.name
    , udb = $.couch.db(twebz.user_db(username))
    ;
  doc.state = "has_pin";
  doc.pin = pin;
  function handleAccessToken(doc) {
    if (doc.state == "has_access") {
      return true;
    }
  }
  udb.saveDoc(doc, {
    success : function() {
      if (!$$(widget).pin_changes) {
        $$(widget).pin_changes = udb.changes("0", {include_docs : true});
        $$(widget).pin_changes.onChange(function(resp) {
          for (var i=0; i < resp.results.length; i++) {
            if (handleAccessToken(resp.results[i].doc)) {
              $$(widget).pin_changes.stop();
            }
          };
        });
      }
    }
  })
  return false;
};