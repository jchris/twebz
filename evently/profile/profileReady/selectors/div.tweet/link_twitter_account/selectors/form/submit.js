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
                tweb : {
                  link_account : {
                    service : "twitter",
                    couch_user : username,
                    state : "request"
                  }
                }
              });
            }
          }
        });
      }
    ;
  if (!$$(widget).changes) {
    $$(widget).changes = udb.changes("0", {include_docs : true});
    $$(widget).changes.onChange(function(resp) {
      $.log(resp);
      if (!link_requested) {
        request_link();
      }
    });
  }
  return false;
};