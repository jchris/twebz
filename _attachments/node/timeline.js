// based on the 'osb' test from @mikeal's tweetstream
var tweetstream = require('tweetstream'),
    fs = require('fs'),
    events = require('events'),
    path = require('path'),
    request = require('request'),
    sys = require('sys'),
    couchdb = require("couchdb");

function log(e) {
  sys.puts(sys.inspect(e));
};

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));


var searches = tweetstream.createTweetStream({track:config.track,
                                            username:config.username,
                                            password:config.password});
var timeline = tweetstream.createTweetStream({username:config.username,
                                            password:config.password});

function saveTweetToCouch(tweet) {
  if (tweet.id) {
    tweet._id = tweet.id.toString();
    if (tweet.text && tweet.user) {
      request({
        uri:config.couch, method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify(tweet)
        }, function (e, resp, body) {
          if (resp && resp.statusCode !== 201) sys.puts(sys.inspect(resp), sys.puts(body));
          // else {sys.puts(body)};
      });
    };
  } else {
    sys.puts("not a tweet:");
    sys.puts(sys.inspect(tweet));
  }
};

searches.addListener("tweet", saveTweetToCouch);
timeline.addListener("tweet", saveTweetToCouch);

// connect to the couchdb changes feed to find work to do
// 
// function listenForWork () {
//   var end = '\n';
//   var buffer, stream = new events.EventEmitter();
//   stream.addListener("data", function (chunk) {
//     var blob;
//     buffer += chunk.toString('utf8');
//     // sys.puts(buffer);
//     if (buffer.indexOf(end) !== -1) {
//       while (buffer.indexOf(end) !== -1) {
//         blob = buffer.slice(0, buffer.indexOf(end));
//         buffer = buffer.slice(buffer.indexOf(end) + end.length);
//         if (blob.length > 0) {
//           stream.emit('line', blob);
//         }
//       }
//     }
//   });
//   stream.write = function (chunk) {stream.emit('data', chunk)};
//   stream.end = function () {stream.emit("end")};
//   stream.addListener("line", function(line) {
//    sys.puts(line);
//   })
//   function start() {
//     request({
//       uri : config.couch + "/_changes?feed=continuous&heartbeat=true&filter=tweb/tweb",
//       headers:{'content-type':'application/json'},
//       responseBodyStream : stream
//     }, function() {
//       // if we disconnected, retry
//       // todo keep track of high-seq
//       setTimeout(start, 100);
//     });    
//   };
//   start();
// }
// listenForWork()

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
