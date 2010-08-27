// based on the 'osb' test from @mikeal's tweetstream
var tweetstream = require('tweetstream'),
    fs = require('fs'),
    events = require('events'),
    path = require('path'),
    request = require('request'),
    sys = require('sys'),
    couchdb = require("couchdb"),
    cc = require("couch-client")
    ;

function log(e) {
  sys.puts(sys.inspect(e));
};

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));


var searches = tweetstream.createTweetStream({track:config.track,
                                            username:config.username,
                                            password:config.password});
var timeline = tweetstream.createTweetStream({username:config.username,
                                            password:config.password});

var twebdb = cc(config.couch);

function saveTweetToCouch(tweet) {
  twebdb.save(tweet, function(er, doc) {
    if (er) {
      log(er);
    }
  });
};

searches.addListener("tweet", saveTweetToCouch);
timeline.addListener("tweet", saveTweetToCouch);

function workFromChanges() {
  var client = couchdb.createClient(5984, 'localhost'),
    db = client.db('tweb'); // todo use config
  var stream = db.changesStream({
    filter : "tweb/tweb"
  });
  stream.addListener("data", function(change) {
    db.getDoc(change.id, function(e, doc) {
      log(doc)
    })
  });
};

workFromChanges();
