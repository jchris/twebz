function(resp) {
  var app = $$(this).app
    , twebz = app.require("lib/twebz")
    , items = $(this).parents("#items")
    , more = $("a[href=#more]", items)
    ;
  if (resp.rows.length < 10) {
    more.click();
  }
  return {
    tweets : resp.rows.map(function(r) {
      return twebz.tweetli(r.value);
    })
  }
};
