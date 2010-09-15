function() {
  var widget = $(this)
  , username = $("[name=username]", widget).val()
  , app = $$(widget).app
  , twebz = app.require("lib/twebz").init(app.db.name)
  , security = app.require("lib/security")
  , info = $$("#account").info
  , udb = $.couch.db(twebz.user_db(username))
  , docid = twebz.user_setup_docid(username)
  ;
  function setupComplete() {
    app.db.openDoc(docid, {
      success : function(doc) {
        doc.twebz.state = "setup-complete";
        app.db.saveDoc(doc, {
          success : function() {
            widget.trigger("_init");
          }
        });
      }
    });
  };
  function setSecret() {
    udb.saveDoc({
      _id : twebz.secret_docid,
      token : twebz.randomToken()
    }, {
      success : setupComplete,
      error : function(code, error, reason) {
        if (error == "conflict") {
          setupComplete();
        } else {
          alert(er.reason);
        }
      }
    });
  };
  function setAccess() {
    security.addReaders(udb, [username, twebz.app_user], function() {
      udb.saveDoc({
        _id : "_design/twebz-private",
        views : app.ddoc["private"].views
      }, {
        success : setSecret,
        error : setSecret
      });
    });
  };
  $.couch.db(info.authentication_db).openDoc("org.couchdb.user:"+username, {
    success : function() {
      udb.create({
        success : setAccess,
        error : setAccess
      });
    }
  });
  return false;
};