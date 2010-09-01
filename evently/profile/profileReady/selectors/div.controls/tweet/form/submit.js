function() {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    , f = $(this).serializeObject()
    , profile = $$("#profile").profile
    , tweet = {
        text : f.status,
        user : {
          
        },
        twebz : {
          profile : profile
        }
      }
    ;
  
  return false;
};