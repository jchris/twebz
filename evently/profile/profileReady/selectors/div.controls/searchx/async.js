function(cb) {
  // get the search doc, display the searches
  // save an update request to the search doc
  // when the search doc changes, update the display
  var widget = $(this)
  , app = $$(widget).app
  , userCtx = $$("#account").userCtx
  , twebz = app.require("lib/twebz").init(app.db.name)
  , udb = $.couch.db(twebz.user_db(userCtx.name))
  ;

  udb.view("twebz-private/twitter-accts", {
    success : function(resp) {
      var accts = [];
      for (var i=0; i < resp.rows.length; i++) {
        accts.push(resp.rows[i].value.access_params);
      }
      if (!$$("#profile").requestedSearches) {
        app.db.saveDoc({
          twebz : {
            type : "saved-searches",
            state : "request",
            couch_user : userCtx.name,
            twitter_accts : accts
          }
        });
        $$("#profile").requestedSearches = true;
      }
      app.db.view("twebz/searches", {
        keys : accts.map(function(acct) {return acct.user_id}),
        success : cb
      });
    }
  });

};