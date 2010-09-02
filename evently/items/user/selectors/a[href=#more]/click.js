function(e) {
  var name = e.data.args[1].screen_name.toLowerCase()
    , app = $$(this).app
    ;
  app.db.saveDoc({
    twebz : {
      type : "user-recent",
      state : "request",
      screen_name : name,
      couch_user : $$("#account").userCtx.name,
      twitter_acct : $.cookie("twitter_acct")
    }
  });
  return false;
};