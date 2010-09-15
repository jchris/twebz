function(e, redo) {
  var widget = $(this)
    , app = $$(widget).app
    , userCtx = $$("#account").userCtx
    , twebz = app.require("lib/twebz").init(app.db.name)
    , userDocid = twebz.user_setup_docid(userCtx.name)
    ;
  function requestUserSetup(userSetupDoc) {
    userSetupDoc = userSetupDoc || {
      _id : userDocid,
      username : userCtx.name
    };
    userSetupDoc.twebz = userSetupDoc.twebz || {};
    userSetupDoc.twebz.type = "user-setup";
    userSetupDoc.twebz.state = "setup-requested";
    app.db.saveDoc(userSetupDoc, {
      success : function() {
        if (userCtx.roles.indexOf("_admin") != -1) {
          widget.trigger("admin");
        } else {
          widget.trigger("wait_for_admin");
        }
      }
    });
  }
  app.db.openDoc(userDocid, {
    success : function(doc) {
      if (!redo && doc.twebz && doc.twebz.state == "setup-complete") {
        widget.trigger("tweet");
      } else {
        requestUserSetup(doc);      
      }
    },
    error : function() {
      requestUserSetup();      
    }
  });
};