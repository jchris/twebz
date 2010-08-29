function() {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    , username = $$("#account").userCtx.name
    , udb = $.couch.db(twebz.user_db(username))
    , link_requested = false
    , request_link = function() {
        // view to make sure there isn't already an in progress request
        app.view("account-links",{
          key : ["request", username],
          success : function(resp) {
            if (resp.rows.length == 0) {
              app.db.saveDoc({
                twebz : {
                  type : "link_account",
                  service : "twitter",
                  couch_user : username,
                  state : "request"
                }
              });
            }
          }
        });
      }
    ;
  function handleRequestToken(doc) {
    if (doc.type == "request_token" && doc.state == "new") {
      var callbackURL = document.location.href.split("/");
      callbackURL.pop();
      callbackURL = callbackURL.join('/');
      $.log(callbackURL);
    }
  }
  
  if (!$$(widget).changes) {
    $$(widget).changes = udb.changes("0", {include_docs : true});
    $$(widget).changes.onChange(function(resp) {
      $.log(resp)
      if (!link_requested) {
        request_link();
      }
      for (var i=0; i < resp.results.length; i++) {
        handleRequestToken(resp.results[i].doc);
      };
    });
  }
  return false;
};