var tweetstream = require('tweetstream')
  , sys = require('sys')
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , events = require('events')
  , request = require('request')
  , couchdb = require("couchdb")
  , cc = require("couch-client")
  , OAuth= require("oauth").OAuth
  ;

function log(e) {
  sys.puts(sys.inspect(e));
};

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))
  , dburl = url.parse(config.db)
  , dbname = dburl.pathname.split('/')[1]
  , twebz = require('../lib/twebz').init(dbname)
  , client = couchdb.createClient(dburl.port, dburl.hostname, 
      twebz.app_user, config.passcode)
  , db = client.db(dbname)
  , config_db = client.db(twebz.config_db)
  ;

config_db.getDoc(twebz.twitter_keys_docid, function(er, doc) {
  var twitter_oauth;
  if (er) {
    log("error loading twitter_keys");
    log(er);
  } else {
    twitter_oauth = new OAuth(
      "http://twitter.com/oauth/request_token",
      "http://twitter.com/oauth/access_token", 
      doc.consumer_key,  doc.consumer_secret, 
      "1.0", null, "HMAC-SHA1");
  }
  
  // listen for _changes on twebz db
  function getSince() {
    return 0; //todo use a view to find the highest
  };

  function handleChange(change) {
    switch (change.doc.twebz.type) {
      case 'link_account':
        linkAccount(change.doc);
        break;
      default:
        log("unhandled change");
        log(change);
    }
  };

  function linkAccount(doc) {
    log("linkAccount state: "+doc.twebz.state);
    switch (doc.twebz.state) {
      case 'request':
        requestToken(doc);
        break;
      case 'launched':
        requestTokenVerified(doc);
        break;
      default:
        log("linkAccount unknown state");
        log(doc);
    }
  }

  function requestToken(doc) {
    twitter_oauth.getOAuthRequestToken(
      function(er, 
          oauth_token, oauth_token_secret, 
          oauth_authorize_url, params) {
        if (er) {
          doc.twebz.state = "error";
          doc.twebz.error = er;
          db.saveDoc(doc)
        } else {
          // we have a request token, save it to the user-db
          var udb = client.db(twebz.user_db(doc.twebz.couch_user));
          udb.saveDoc({
            type : "request_token",
            state : "new",
            oauth_token_secret : oauth_token_secret,
            oauth_token : oauth_token,
            oauth_authorize_url : oauth_authorize_url,
            params : params
          }, function(er, resp) {
            if (!er) {
              doc.twebz.state = "launched";
              db.saveDoc(doc);              
            }
          });
        }
    })
  };

  function requestTokenVerified(doc) {
    // hang on udb changes waiting for the request_token response to be saved
    var udb = client.db(twebz.user_db(doc.twebz.couch_user))
      , stream = udb.changesStream({
          include_docs : true,
          since : 0
        });
    stream.addListener("data", function(change) {
      log("change")
      log(change)
    });
  }


  function workFromChanges() {
    var stream = db.changesStream({
      filter : "twebz/twebz",
      include_docs : true,
      since : getSince()
    });
    stream.addListener("data", handleChange);
  };

  workFromChanges();
});

