function(resp) {
  var app = $$(this).app,
    twebz = app.require("lib/twebz");
  return {
    tweets : resp.rows.map(function(r) {
      return twebz.tweetli(r.doc || r.value);
    })
  }
};