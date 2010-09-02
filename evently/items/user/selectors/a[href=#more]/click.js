function(e) {
  var name = e.data.args[1].screen_name.toLowerCase()
    , a = $(this)
    , app = $$(a).app
    ;
  app.db.saveDoc({
    twebz : {
      type : "user-recent",
      state : "request",
      screen_name : name,
      couch_user : $$("#account").userCtx.name,
      twitter_acct : $.cookie("twitter_acct")
    }
  }, {
    success : function() {
      a.text("Loading...");
    }
  });
  return false;
};