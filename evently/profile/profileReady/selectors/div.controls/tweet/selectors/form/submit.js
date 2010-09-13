function(e) {
  var widget = $(this)
    , app = $$(widget).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    , udb = $.couch.db(twebz.user_db($$("#account").userCtx.name))
    , jsond = app.require("lib/jsond")
    , sha1 = app.require("lib/sha1")
    , f = $(this).serializeObject()
    , profile = $$("#profile").profile
    , tweet = {
        _id : $.couch.newUUID(),
        text : f.status,
        created_at : new Date(),
        twebz : {
          state : "unsent",
          type :"tweet",
          profile : profile
        }
      }
    ;
  if (f.in_reply_to_status_id) {
    tweet.in_reply_to_status_id = f.in_reply_to_status_id;
  }
  udb.openDoc(twebz.secret_docid, {
    success : function(doc) {
      var key = doc.token;
      app.db.openDoc(twebz.profile_docid(f.account), {
        success : function(doc) {
          tweet.user = doc;
          var string = jsond.stringify(tweet)
            , hmac = sha1.b64_hmac_sha1(key, string)
            ;
          tweet.twebz_signature = {
            method : "b64_hmac_sha1",
            token : hmac
          };
          app.db.saveDoc(tweet, {
            success : function() {
              $('[name=in_reply_to_status_id]').val("");
              $('[name=status]').val("");
            }
          });
        }
      });
    }
  });
  return false;
};