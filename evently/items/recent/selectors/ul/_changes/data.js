function(r) {
  var app = $$(this).app
    , twebz = app.require("lib/twebz")
    ;
  return twebz.tweetli(r.value);
};
