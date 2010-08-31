function() {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    , username = $$("#account").userCtx.name
    , udb = $.couch.db(twebz.user_db(username))
    , link_requested = false
    , oauth_redirected = false
    ;

  function request_link() {
    // view to make sure there isn't already an in progress request
    app.view("account-links",{
      keys : [["request", username], ["launched", username]],
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

  function handleRequestToken(doc) {
    if (!oauth_redirected && doc.type == "request_token" && doc.state == "new") {
      var oauth_url = "https://api.twitter.com/oauth/authorize?oauth_token="
        + doc.oauth_token;
      oauth_redirected = true;
      widget.trigger("direct_to_oauth",[doc, oauth_url]);
      return true;
    }
  }

  if (!$$(widget).changes) {
    $$(widget).changes = udb.changes("0", {include_docs : true});
    $$(widget).changes.onChange(function(resp) {
      if (!link_requested) {
        request_link();
        link_requested = true;
      }
      for (var i=0; i < resp.results.length; i++) {
        if (handleRequestToken(resp.results[i].doc)) {
          $$(widget).changes.stop();
        }
      };
    });
  }
  return false;
};