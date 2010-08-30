function() {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    ;
  function updateDDoc(users) {
    var user = users.pop()
      , udb = $.couch.db(twebz.user_db(user))
      ;
    if (!user) {return;}
    udb.openDoc("_design/twebz-private", {
      success : function(doc) {
        doc.views = app.ddoc["private"].views;
        udb.saveDoc(doc, {
          success : function() {
            updateDDoc(users);
          }
        });
      },
      error : function() {
        udb.saveDoc({
          _id : "_design/twebz-private",
          views : app.ddoc["private"].views
        }, {
          success : function() {
            updateDDoc(users);
          }
        });
      }
    })
  }
  app.view("user-setup", {
    success : function(resp) {
      var users = [];
      for (var i=0; i < resp.rows.length; i++) {
        users.push(resp.rows[i].value);
      };
      updateDDoc(users);
    }
  })
};