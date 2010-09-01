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
  function tweasycb(er, data, resp) {
    if (!er) {
      try {
        data = JSON.parse(data);
      } catch(e) {}
    }
    cb(er, data, resp);
  };
  if (method == "GET") {
    url = url + '?' + querystring.stringify(params);
    this.oauth.get(url, this.creds.oauth_access_token, 
      this.creds.oauth_access_token_secret, tweasycb);
  } else if (method == "POST") {
    this.oauth.post(url, this.creds.oauth_access_token, 
      this.creds.oauth_access_token_secret, params, tweasycb);
  }
}

TweasyClient.prototype.user = function(params, cb) {
  this.request("http://api.twitter.com/1/users/show.json", params, cb);
}

TweasyClient.prototype.updateStatus = function(status /*, annotations, cb */) {
  var cb, annotations, params = {};
  if (arguments.length == 3) {
    cb = arguments[2];
    annotations = arguments[1];
  } else {
    cb = arguments[1];
  }
  params.status = status;
  if (annotations) {
    params.annotations = JSON.stringify(annotations);
  }
  this.request("http://api.twitter.com/1/statuses/update.json", params, "POST", cb);
}

exports.init = function(oauth, creds) {
  return new TweasyClient(oauth, creds);
};

