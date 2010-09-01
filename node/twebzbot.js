var tweetstream = require('tweetstream')
  , sys = require('sys')
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , events = require('events')
  , request = require('request')
  , couchdb = require("couchdb")
  , tweasy = require("./tweasy")
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
  
  function ok(er, doc, couch) {
    couch = couch || db; // default to db from closure
    if (er) {
      doc.twebz = doc.twebz || {};
      doc.twebz.state = "error";
      doc.twebz.error = er;
      couch.saveDoc(doc);
      return false
    } else {
      return true;
    }
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

  function twitterConnection(couch_user, cb) {
    // load user creds
    var udb = client.db(twebz.user_db(doc.twebz.couch_user))
      ;
    
  }

  function getProfileInfo(doc) {
    if (doc.twebz.twitter_user && doc.twebz.twitter_user.user_id) {
      var tc = tweasy.createClient()
        , profile = tc.user({
          user_id : doc.twebz.twitter_user.user_id
        });
      profile._id = "com.twitter.user:" + doc.twebz.twitter_user.user_id;
      db.saveDoc(profile, function(er, resp) {
        if (ok(er, doc)) {
          doc.twebz.state = "complete";
          db.saveDoc(doc);
        }
      });
    }
  }
  

  function linkAccount(doc) {
    log("linkAccount state: "+doc.twebz.state);
    switch (doc.twebz.state) {
      case 'request':
        requestToken(doc);
        break;
      case 'launched':
        requestTokenVerified(doc);
        break;
      case 'connected':
        getProfileInfo(doc);
        break;
      case 'complete':
        break;
      case 'error':
        log(doc.twebz.error);
      default:
        log("linkAccount unknown state");
        log(doc);
    }
  }

  function requestToken(doc) {
    var udb = client.db(twebz.user_db(doc.twebz.couch_user));
    udb.view("twebz-private","oauth-tokens",{
      key : ["request_token", "new"]
    }, function(er, resp) {
      if (ok(er, doc)) {
        if (resp.rows.length > 0) {
          // we already have a valid request token, do nothing
          log("no need to requestToken");
        } else {
          log("requestToken!");
          twitter_oauth.getOAuthRequestToken(function(er, 
                oauth_token, oauth_token_secret, params) {
            if (ok(er, doc)) {
              // we have a request token, save it to the user-db
              udb.saveDoc({
                type : "request_token",
                state : "new",
                created_at : new Date(),
                oauth_token_secret : oauth_token_secret,
                oauth_token : oauth_token,
                params : params
              }, function(er, resp) {
                if (ok(er, doc)) {
                  doc.twebz.state = "launched";
                  db.saveDoc(doc);
                }
              });
            }
          });
        }
      }
    });
  };

  function accessToken(udb, doc, rdoc) {
    twitter_oauth.getOAuthAccessToken(doc.oauth_token, doc.oauth_token_secret,
      doc.pin, function(er, oauth_access_token, oauth_access_token_secret, extra) {
        if (ok(er, doc)) {
          doc.state = "has_access";
          doc.oauth_access_token = oauth_access_token;
          doc.oauth_access_token_secret = oauth_access_token_secret;
          doc.access_params = extra;
        }
        udb.saveDoc(doc, function(er) {
          if (ok(er, doc)) {
            rdoc.twebz.twitter_user = extra;
            rdoc.twebz.state = "connected";
          }
          db.saveDoc(rdoc);
        });
      });
  }

  function requestTokenVerified(doc) {
    // hang on udb changes waiting for the request_token response to be saved
    var udb = client.db(twebz.user_db(doc.twebz.couch_user))
      , stream = udb.changesStream({
          include_docs : true,
          since : 0
        });
    stream.addListener("data", function(change) {
      var cdoc = change.doc;
      if (cdoc.type == "request_token" && cdoc.state == "has_pin" && cdoc.pin) {
        log("got a PIN we can use "+cdoc.pin);
        // disconnect from changes
        accessToken(udb, cdoc, doc)
      }
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

