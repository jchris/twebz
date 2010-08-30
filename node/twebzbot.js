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
    var udb = client.db(twebz.user_db(doc.twebz.couch_user));
    udb.view("twebz-private","oauth-tokens",{
      key : ["request_token", "new"]
    }, function(er, resp) {
      if (er) {
        doc.twebz.state = "error";
        doc.twebz.error = er;
        db.saveDoc(doc);
      } else {
        if (resp.rows.length > 0) {
          // we already have a valid request token, do nothing
          log("no need to requestToken");
        } else {
          log("requestToken!");
          twitter_oauth.getOAuthRequestToken(function(er, 
                oauth_token, oauth_token_secret, params) {
            if (er) {
              doc.twebz.state = "error";
              doc.twebz.error = er;
              db.saveDoc(doc);
            } else {
              // we have a request token, save it to the user-db
              udb.saveDoc({
                type : "request_token",
                state : "new",
                created_at : new Date(),
                oauth_token_secret : oauth_token_secret,
                oauth_token : oauth_token,
                params : params
              }, function(er, resp) {
                if (er) {
                  doc.twebz.state = "error";
                  doc.twebz.error = er;
                  db.saveDoc(doc);
                } else {
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

  function accessToken(udb, doc) {
    twitter_oauth.getOAuthAccessToken(doc.oauth_token, doc.oauth_token_secret,
      doc.pin, function(er, oauth_access_token, oauth_access_token_secret, extra) {
        if (er) {
          doc.state = "error";
          doc.error = er;
        } else {
          doc.state = "has_access";
          doc.oauth_access_token = oauth_access_token;
          doc.oauth_access_token_secret = oauth_access_token_secret;
          doc.access_params = extra;
        }
        udb.saveDoc(doc);
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
      var doc = change.doc;
      if (doc.type == "request_token" && doc.state == "has_pin" && doc.pin) {
        log("got a PIN we can use "+doc.pin);
        // disconnect from changes
        accessToken(udb, doc)
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

