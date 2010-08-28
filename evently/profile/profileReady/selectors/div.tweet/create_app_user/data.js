function() {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    ;
  twebz.password = $.couch.newUUID().split("").sort(function() {
    return Math.random() - Math.random();
  }).join("");
  return twebz;
};