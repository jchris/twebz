function(e) {
  var name = e.data.args[1].screen_name.toLowerCase()
    , a = $(this)
    , app = $$(a).app
    ;
  if ($(a).text() != "Loading...") {
    app.db.saveDoc({
      twebz : {
        type : "user-recent",
        state : "request",
        screen_name : name,
        couch_user : $$("#account").userCtx.name,
        twitter_acct : $.cookie("twitter_acct")
      }
    });
  }
  a.text("Loading...");
  return false;
};