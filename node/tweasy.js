var TweasyClient
  , querystring = require('querystring')
  , sys = require('sys')
  ;

TweasyClient = function(oauth, creds) {
  this.creds = creds;
  this.oauth = oauth;
};

TweasyClient.prototype.request = function(url, params /*, method, cb */) {
  var cb, method;
  if (arguments.length == 4) {
    cb = arguments[3];
    method = arguments[2];
  } else {
    cb = arguments[2];
    method = "GET";
  }
  if (method == "GET") {
    url = url + '?' + querystring.stringify(params);
    this.oauth.get(url, this.creds.oauth_access_token, this.creds.oauth_access_token_secret, cb);
  } else if (method == "POST") {
    this.oauth.post(url, this.creds.oauth_access_token, this.creds.oauth_access_token_secret, 
      params, cb);
  }
}

TweasyClient.prototype.user = function(params, cb) {
  this.request("http://api.twitter.com/1/users/show.json", params, cb);
}

exports.init = function(oauth, creds) {
  return new TweasyClient(oauth, creds);
};

