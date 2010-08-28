function() {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    , password = $(".password", widget).text()
    ;
  $.couch.signup({name:twebz.app_user}, password, {
    success : function() {
      
    }
  })
};