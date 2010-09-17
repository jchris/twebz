var tweetstream = require('tweetstream')
  , sys = require('sys')
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , events = require('events')
  , request = require('request')
  , couchdb = require("couchdb")
  , tweasy = require("tweasy")
  , stately = require("stately")
  , OAuth= require("oauth").OAuth
  , jsond = require("../lib/jsond")
  , security = require("../lib/security")
  , sha1 = require("../lib/sha1")
  ;

var log = console.log;

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))
  , dburl = url.parse(config.db)
  , dbname = dburl.pathname.split('/')[1]
  , twebz = require('../lib/twebz').init(dbname)
  , admin_client
  , client = couchdb.createClient(dburl.port, dburl.hostname, 
      twebz.app_user, config.passcode)
  , db = client.db(dbname)
  , config_db = client.db(twebz.config_db)
  ;

if (config.admin_pass && config.admin_user) {
  admin_client = couchdb.createClient(dburl.port, dburl.hostname, 
      config.admin_user, config.admin_pass);
}

config_db.getDoc(twebz.twitter_keys_docid, function(er, doc) {
  var twitter_oauth;
  if (er) {
    log("error loading twitter_keys");
    log(er);
    log([twebz.app_user, config.passcode]);
    process.exit(1);
  } else {
    twitter_oauth = new OAuth(
      "http://twitter.com/oauth/request_token",
      "http://twitter.com/oauth/access_token", 
      doc.consumer_key,  doc.consumer_secret, 
      "1.0", null, "HMAC-SHA1");
  }
  
  function ok(er, doc, note, couch) {
    couch = couch || db; // default to db from closure
    if (er) {
      // log(['error', doc._id, er]);
      doc.twebz = doc.twebz || {};
      doc.twebz.state = "error";
      doc.twebz.error = er;
      if (note) {
        doc.twebz.error_note = note;
      } else {
        delete doc.twebz.error_note;
      }
      couch.saveDoc(doc);
      return false
    } else {
      return true;
    }
  }

  function requestSearch(doc) {
    twitterConnection(doc.twebz.couch_user, 
      doc.twebz.twitter_acct, {},
      function(tc) {
        // todo check to see what tweets we already have to avoid fetching what we don't need
        log("fetch search term "+doc.twebz.term);
        tc.search({q : doc.twebz.term, rpp:100},
          function(er, search) {
            if (ok(er, doc)) {
              var tweets = search.results;
              db.bulkDocs({
                docs : tweets.map(function(t) {
                  t._id = "twitter-"+t.id;
                  t.user = {
                    screen_name : t.from_user,
                    profile_image_url : t.profile_image_url
                  };
                  return t;
                })
              }, function(er, resp) {
                if (ok(er, doc)) {
                  doc.twebz.tweet_range = {
                    start : tweets[tweets.length -1].id,
                    end : search.max_id
                  }
                  doc.twebz.state = "fetched";
                  db.saveDoc(doc);
                }
              });
            }
          });
      });
  };

  function requestMoreTweets(doc) {
    twitterConnection(doc.twebz.couch_user, 
      doc.twebz.twitter_acct, {},
      function(tc) {
        // todo check to see what tweets we already have to avoid fetching what we don't need
        db.view("twebz", "recent-by-user", {
          limit : 1,
          startkey : [doc.twebz.screen_name.toLowerCase()]
        }, function(er, view) {
          var max = view.rows[0].value.id-1;
          log("fetch more tweets from "+doc.twebz.screen_name+" starting at "+max);
          tc.userTimeline({
            screen_name : doc.twebz.screen_name, 
            count:100, max_id : max
          },
            function(er, tweets) {
              if (ok(er, doc)) {
                db.bulkDocs({
                  docs : tweets.map(function(t) {
                    t._id = "twitter-"+t.id;
                    return t;
                  })
                }, function(er, resp) {
                  if (ok(er, doc)) {
                    if (tweets.length > 0) {
                      doc.twebz.tweet_range.start = tweets[tweets.length -1].id;
                    } else {
                      doc.twebz.state = "done";
                    }
                    db.saveDoc(doc);
                  }
                });
              }
            });
        });
      });
  }
  
  function requestSavedSearches(doc) {
    var acct;
    doc.twebz.twitter_accts.forEach(function(acct) {
      var docid = "saved-searches-"+acct.user_id;
      twitterConnection(doc.twebz.couch_user, 
        acct.user_id, {},
        function(tc) {
          tc.savedSearches(function(er, resp) {
            if (ok(er, doc)) {
              db.getDoc(docid, function(er, odoc) {
                var sdoc = {
                  _id : docid,
                  twebz : {
                    type : "saved-searches",
                    state : "results",
                    acct : acct
                  },
                  searches : resp
                }
                if (odoc) {
                  sdoc._rev = odoc._rev;
                }
                db.saveDoc(sdoc, function(er, resp) {
                  if (ok(er, doc)) {
                    doc.twebz.state = "fetched";
                    db.saveDoc(doc);
                  }
                });
              });
            }
          });
        });
    });
  }

  function requestRecentTweets(doc) {
    twitterConnection(doc.twebz.couch_user, 
      doc.twebz.twitter_acct, {},
      function(tc) {
        // todo check to see what tweets we already have to avoid fetching what we don't need
        log("fetch recent tweets from "+doc.twebz.screen_name);
        tc.userTimeline({screen_name : doc.twebz.screen_name, count:100},
          function(er, tweets) {
            if (ok(er, doc)) {
              db.bulkDocs({
                docs : tweets.map(function(t) {
                  t._id = "twitter-"+t.id;
                  return t;
                })
              }, function(er, resp) {
                if (ok(er, doc)) {
                  resp.forEach(function(r) {
                    if (r.error && r.error != "conflict") {
                      log(r);
                    }
                  });
                  if (tweets.length > 0) {
                    doc.twebz.tweet_range = {
                      start : tweets[tweets.length -1].id,
                      end : tweets[0].id
                    };
                  }
                  doc.twebz.state = "fetched";
                  db.saveDoc(doc);
                }
              });
            }
          });
      });
  };

  function twitterConnection(couch_user, user_id, opts, cb) {
    // load user creds
    var udb = client.db(twebz.user_db(couch_user));
    udb.view("twebz-private", "twitter-accts", {
      key : parseInt(user_id)
    }, function(er, resp) {
      if (er) {
        log("no private database for "+couch_user);
      } else if (resp.rows[0]) {
        var v = resp.rows[0].value
          , tc = tweasy.init(twitter_oauth, {
            access_token : v.oauth_access_token,
            access_token_secret : v.oauth_access_token_secret
          }, opts);
        cb(tc);
      } else {
        log("can't get twitter conection for "+couch_user+" and "+user_id);
      }
    });
  }

  function tweetStreamListeners(stream, restartFun, restartArgs) {
    stream.addListener("json", function(json) {
      if (json.friends) {
      } else {
        if (json.id) {
          json._id = "twitter-"+json.id; //avoid duplicates
        }
        db.saveDoc(json);
      }
    });
    stream.addListener("error", function(er) {
      log("error streaming ", restartArgs);
      log(er)
      setTimeout(function() {
        log("restart stream  ", restartArgs);
        restartFun.apply(null, restartArgs);
      }, 1000);
    });
    stream.addListener("end", function() {
      log("end streaming ", restartArgs);
      setTimeout(function() {
        log("restart stream ", restartArgs);
        restartFun.apply(null, restartArgs);
      }, 1000);
    });
  };

  function streamTweets(couch_user, user_id) {
    log("streamTweets for " + couch_user + " on twitter acct " + user_id);
    twitterConnection(couch_user, user_id, {}, function(tc) {
      var stream = tc.userStream();
      tweetStreamListeners(stream, streamTweets, [couch_user, user_id]);
    });
  };

  function validSignature(key, doc) {
    var clone = JSON.parse(JSON.stringify(doc));
    delete clone._rev;
    delete clone.twebz_signature;
    delete clone.twebz.seq;
    var string = jsond.stringify(clone)
      , hmac = sha1.b64_hmac_sha1(key, string)
      , token = doc.twebz_signature && doc.twebz_signature.token
      ;
    if (token && 
        hmac === token) {
      return true;
    } else {
      log("invalid signature! "+doc._id);
      log("got: "+hmac+" need: "+token);
      return false;
    }
  }

  function sendRetweet(doc) {
    // first check the hmac
    var udb = client.db(twebz.user_db(doc.twebz.couch_user));
    udb.getDoc(twebz.secret_docid, function(er, secret) {
      if (ok(er, doc)) {
        var key = secret.token;
        if (validSignature(key, doc)) {
          twitterConnection(doc.twebz.couch_user, 
            doc.twebz.twitter_acct, {}, function(tc) {
              tc.retweet(doc.twebz.id, function(er, resp) {
                if (ok(er, doc)) {
                  log("sent retweet for "+doc.twebz.twitter_acct+": "+doc.twebz.id);
                  doc.twebz.state = 'sent';
                  db.saveDoc(doc);
                }                
              });
            });
          }
        }
    });
  };

  function sendTweet(doc) {
    // first check the hmac
    var udb = client.db(twebz.user_db(doc.twebz.profile.name));
    var params = {annotations: [{twebz : {id : doc._id}}]};
    if (doc.in_reply_to_status_id) {
      params.in_reply_to_status_id = doc.in_reply_to_status_id;
    }
    udb.getDoc(twebz.secret_docid, function(er, secret) {
      if (ok(er, doc)) {
        var key = secret.token;
        if (validSignature(key, doc)) {
          twitterConnection(doc.twebz.profile.name, 
            doc.user.id, {}, function(tc) {
              tc.updateStatus(doc.text, params, 
                function(er, resp) {
                  if (ok(er, doc)) {
                    log("sent tweet for "+doc.user.screen_name+": "+doc.text);
                    doc.twebz.state = 'sent';
                    doc.twebz.twitter_id = resp.id;
                    db.saveDoc(doc);
                  }
              });
            });
        }
      }
    });
  }

  function setUserAccess(udb, username, cb) {
    udb.getDoc("_security", function(er, secObj) {
      if (er) {
        log(er)
      } else {
        secObj = security.applyReaders(secObj, [username, twebz.app_user]);
        udb.saveDoc("_security", secObj, cb);
      }
    });
  };

  var ddoc = null;
  function withTwebzDDoc(fun) {
    if (ddoc) {
      fun(ddoc);
    } else {
      db.getDoc("_design/twebz", function(er, doc) {
        if (er) {
          console.log(er)
        } else {
          ddoc = doc;
          fun(ddoc);
        }
      });
    }
  }
  


  function setupUser(doc) {
    if (admin_client) {
      var udb = client.db(twebz.user_db(doc.username))
        , admin_udb = admin_client.db(twebz.user_db(doc.username));
      // check to see if the user exists
      admin_client.request({
        path : "/_session"
      }, function(er, resp) {
        admin_client.db(resp.info.authentication_db)
          .getDoc("org.couchdb.user:"+doc.username, function(er,user) {
            if (ok(er, doc, "no such user")) {
              // create the database for the user
              admin_udb.create(function(er) {
                if ((er && er.error == "file_exists") || ok(er, doc, "create user db "+doc.username)) {
                  // set the access so only the user can access it
                  setUserAccess(admin_udb, doc.username, function(er) {
                    if (ok(er, doc, "setUserAccess")) {
                      withTwebzDDoc(function(ddoc) {
                        // create the design doc for the private db
                        admin_udb.saveDoc({
                          _id : "_design/twebz-private",
                          views : ddoc["private"].views
                        }, function(er) {
                          if ((er && er.error == "conflict") || ok(er, doc, "make private ddoc")) {
                            // create the secret doc
                            admin_client.uuids(1, function(er, resp) {
                              udb.saveDoc({
                                _id : twebz.secret_docid,
                                token : twebz.randomToken(resp.uuids[0])
                              }, function(er) {
                                if ((er && er.error == "conflict") || ok(er, doc, "secret doc")) {
                                  // set the doc to setup complete
                                  doc.twebz.state = "setup-complete";
                                  db.saveDoc(doc);
                                }
                              });
                            });
                          }
                        });
                      });
                    }
                  });
                }
              });
            }
          });
      });
    } else {
      log("add admin_user and admin_pass to the config and twebz will setup users for you");
    }
  }
  

  function getProfileInfo(doc) {
    if (doc.twebz.couch_user && doc.twebz.twitter_user && 
      doc.twebz.twitter_user.user_id) {
      var profile_id = twebz.profile_docid(doc.twebz.twitter_user.user_id);
      db.getDoc(profile_id, function(er, profile_doc) {
        if (er && er.error == "not_found") {
          profile_doc = {_id : profile_id};
        }
        twitterConnection(doc.twebz.couch_user, 
          doc.twebz.twitter_user.user_id, {}, function(tc) {
            tc.userProfile({
              user_id : doc.twebz.twitter_user.user_id
            }, function(er, profile) {
              delete profile.status;
              profile._id = profile_doc._id;
              profile._rev = profile_doc._rev;
              db.saveDoc(profile, function(er, resp) {
                if (ok(er, doc)) {
                  doc.twebz.state = "complete";
                  db.saveDoc(doc);
                }
              });
            });
          });
      });
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
  var oldHighSeq = 0, highSeq = 0;
  setInterval(function() {
    if (oldHighSeq != highSeq) {
      db.getDoc("_local/twebz-seq", function(er, doc) {
        if (doc) {
          doc.seq = highSeq;
          db.saveDoc(doc, function(er) {
            if (!er) {
              oldHighSeq = highSeq
            }
          });
        } else {
          db.saveDoc("_local/twebz-seq", {
            seq : highSeq
          }, function(er) {
            if (!er) {
              oldHighSeq = highSeq
            }
          });
        }
      });
    }
  }, 5000);

  var machine = stately.define({
    _before : function(change, cb) {
      highSeq = change.seq;
      // log("chnage"+change.seq)
      if (change.doc.twebz) {
        // change.doc.twebz.seq = change.seq;
        log("doc: "+change.doc._id+ " state: "+change.doc.twebz.state);
        cb(change.doc);
      }
    },
    _getState : function(doc, cb) {
      cb(doc.twebz.state);
    },
    _getType : function(doc, cb) {
      cb(doc.twebz.type);
    },
    link_account : {
      request : requestToken,
      launched : requestTokenVerified,
      connected : getProfileInfo,
      complete : startUserStreaming
    },
    tweet : {
      unsent : sendTweet
    },
    retweet : {
      unsent : sendRetweet
    },
    "user-setup" : {
      "setup-requested" : setupUser
    },
    "user-recent" : {
      request : requestRecentTweets
    },
    "user-archive" : {
      request : requestRecentTweets,
      fetched : requestMoreTweets
    },
    "search-recent" : {
      request : requestSearch
    },
    "saved-searches" : {
      request : requestSavedSearches
    },
    _default : function(doc) {
      log("unhandled change");
      log(doc);
    },
    error : function(doc) {
      log("error state: "+doc._id);
    }
  });

  // listen for _changes on twebz db
  function getSince(cb) {
    db.getDoc("_local/twebz-seq", function(er, doc) {
      if (doc) {
        cb(doc.seq);
      } else {
        cb(0);
      }
    });
    // db.view("twebz","seq", {random : Math.random()}, function(er, resp) {
    //   if (er) {
    //     log("getSince")
    //     log(er)
    //   } else {
    //     if (resp.rows && resp.rows.length > 0) {
    //       cb(resp.rows[0].value.max);
    //     } else {
    //       cb(0);
    //     }
    //   }
    // });
  };

  function workFromChanges() {
    getSince(function(since) {
      log("starting changes at "+since);
      var stream = db.changesStream({
        filter : "twebz/twebz",
        include_docs : true,
        since : since
      });
      stream.addListener("data", machine.handle);
    });
  };

  function startUserStreaming(doc) {
    if (doc.twebz.couch_user && doc.twebz.twitter_user && 
      doc.twebz.twitter_user.user_id) {
        streamTweets(doc.twebz.couch_user, doc.twebz.twitter_user.user_id);
    }
  }

  function startUserStreams() {
    db.view("twebz","account-links", {
      startkey : ["complete"],
      endkey : ["complete",{}]
    }, function(er, resp) {
      if (!er) {
        if (resp.rows.length > 0) {
          resp.rows.forEach(function(row) {
            if (row.value.twitter_user) {
              streamTweets(row.value.couch_user, row.value.twitter_user.user_id);
            }
          });
          var acct = resp.rows[0].value;
          if (acct.couch_user && acct.twitter_user && acct.twitter_user.user_id) {
            startSearchStream(acct.couch_user, acct.twitter_user.user_id);
          }
        } else {
          log("no users signed up yet");
        }
      }
    });
  }

  function startSearchStream(couch_user, user_id) {
    db.view("twebz", "searches", {}, function(er, view) {
      var terms = [];
      if (!er) {
        view.rows.forEach(function(row) {
          row.value.searchTerms.forEach(function(t) {
            t = t.toLowerCase();
            if (terms.indexOf(t) == -1) {
              terms.push(t);
            }
          })
        });
        if (terms.length > 0) {
          twitterConnection(couch_user, user_id, {}, function(tc) {
            log("stream search for " + couch_user + " on twitter acct " + user_id);
            log(terms.join(','))
            var stream = tc.filterStream({track:terms.join(',')});
            tweetStreamListeners(stream, startSearchStream, [couch_user, user_id]);
          });
        }
      } else {
        log("error streaming tweets")
      }
    });
  }

  workFromChanges();
  startUserStreams();
});
