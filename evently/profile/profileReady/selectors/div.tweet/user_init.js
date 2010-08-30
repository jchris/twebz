function() {
  var widget = $(this)
  , app = $$(widget).app
  , userCtx = $$("#account").userCtx
  , twebz = app.require("lib/twebz").init(app.db.name)
  , docid = twebz.user_setup_docid(userCtx.name)
  ;
  function requestUserSetup(userSetupDoc) {
    userSetupDoc = userSetupDoc || {
      _id : docid,
      username : userCtx.name,
      type : "user-setup"
    };
    userSetupDoc.state = "setup-requested";
    app.db.saveDoc(userSetupDoc, {
      success : function() {
        if (userCtx.roles.indexOf("_admin") != -1) {
          widget.trigger("pending_users");
        } else {
          widget.trigger("wait_for_admin");
        }
      }
    });
  }
  app.db.openDoc(docid, {
    success : function(doc) {
      if (doc.state == "setup-complete") {
        widget.trigger("user_home");
      } else {
        requestUserSetup(doc);      
      }
    },
    error : function() {
      requestUserSetup();      
    }
  })
};