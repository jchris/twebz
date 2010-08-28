function() {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    ;
  var cdb = $.couch.db(twebz.config_db);
  function setAccess() {
    cdb.getDbProperty("_security", {
      success : function(secObj) {
        secObj.readers = secObj.readers || {
          names : [],
          roles : []
        };
        if (secObj.readers.names.indexOf(twebz.app_user) == -1) {
          secObj.readers.names.push(twebz.app_user);
          cdb.setDbProperty("_security", secObj, {
            success : function() {
              widget.trigger("twitter_keypair");
            }
          });
        } else {
          widget.trigger("twitter_keypair");
        }
      }
    });    
  };
  cdb.create({
    success : setAccess,
    error : setAccess
  });  
};