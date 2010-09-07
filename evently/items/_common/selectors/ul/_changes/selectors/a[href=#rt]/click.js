function() {
  var a = $(this)
    , app = $$(a).app
    , twebz = app.require("lib/twebz").init(app.db.name)
    , jsond = app.require("lib/jsond")
    , sha1 = app.require("lib/sha1")
    , udb = $.couch.db(twebz.user_db($$("#account").userCtx.name))
    , li = $(a).parents("li")
    , id = li.attr("data-id")
    , twt = $.cookie("twitter_name")
    , txt = $(".twbody p", li).text()
    , message = 'Retweet "'+txt+'" as '+twt+'?'
    , rtDoc = {
      _id : $.couch.newUUID(),
      twebz : {
        type : "retweet",
        state : "unsent",
        id : id,
        couch_user : $$("#account").userCtx.name,
        twitter_acct : $.cookie("twitter_acct")
      }
    }
    ;
  if (confirm(message))  {
    udb.openDoc(twebz.secret_docid, {
      success : function(doc) {
        var key = doc.token;
        var string = jsond.stringify(rtDoc)
          , hmac = sha1.b64_hmac_sha1(key, string)
          ;
        rtDoc.twebz_signature = {
          method : "b64_hmac_sha1",
          token : hmac
        };
        app.db.saveDoc(rtDoc);
      }
    })
  }
  return false;
};