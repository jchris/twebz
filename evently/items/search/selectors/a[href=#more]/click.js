function(e) {
  var term = e.data.args[1].term.toLowerCase()
    , a = $(this)
    , app = $$(a).app
    ;
  if ($(a).text() != "Loading...") {
    app.db.saveDoc({
      twebz : {
        type : "search-recent",
        state : "request",
        term : term,
        couch_user : $$("#account").userCtx.name,
        twitter_acct : $.cookie("twitter_acct")
      }
    });
  }
  a.text("Loading...");
  return false;
};