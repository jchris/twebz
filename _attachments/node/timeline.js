// based on the 'osb' test from @mikeal's tweetstream
var tweetstream = require('tweetstream'),
    fs = require('fs'),
    path = require('path'),
    request = require('request'),
    sys = require('sys');

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));


var stream = tweetstream.createTweetStream({track:config.track, 
                                            username:config.username, 
                                            password:config.password});

function addFriend(stream, user) {
  // automatically friend anyone who mentions the term...
  stream.rest.friendships.create({id:tweet.user.screen_name, user_id:tweet.user.id, follow:true}, 
    function (error, resp, body) {
      if (body) sys.puts(body);
  });
};

stream.addListener("tweet", function (tweet) {

  tweet._id = tweet.id.toString();
  request({uri:couch, method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(tweet)}, 
    function (e, resp, body) {
      if (resp && resp.statusCode !== 201) sys.puts(sys.inspect(resp), sys.puts(body));
      else {sys.puts(body)};
  })
});
