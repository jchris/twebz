function(e) {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    , f = $(this).serializeObject()
    , profile = $$("#profile").profile
    , tweet = {
        text : f.status,
        created_at : new Date(),
        twebz : {
          state : "unsent",
          type :"tweet",
          profile : profile
        }
      }
    ;
  app.db.openDoc(twebz.profile_docid(f.account), {
    success : function(doc) {
      tweet.user = doc;
      app.db.saveDoc(tweet);
    }
  });
  return false;
};