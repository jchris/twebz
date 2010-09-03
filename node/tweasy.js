var TweasyClient
  , querystring = require('querystring')
  , sys = require('sys')
  , events = require('events')
  ;

function log(e) {
  sys.puts(sys.inspect(e));
};

TweasyClient = function(oauth, creds) {
  this.creds = creds;
  this.oauth = oauth;
};

TweasyClient.prototype.request = function(url, params /*, method, cb */) {
  var cb, method, tweasycb, req;
  if (arguments.length == 4) {
    cb = arguments[3];
    method = arguments[2];
  } else {
    cb = arguments[2];
    method = "GET";
  }
  if (cb) {
    tweasycb = function (er, data, resp) {
      try {
        data = JSON.parse(data);
        cb(er, data, resp);
      } catch(e) {
        cb({
          error : er,
          json_error : e
        }, data, resp);
      }
    };
  };

  if (method == "GET") {
    if (params) {
      url = url + '?' + querystring.stringify(params);  
    }
    req = this.oauth.get(url, this.creds.oauth_access_token, 
      this.creds.oauth_access_token_secret, tweasycb);
  } else if (method == "POST") {
    req = this.oauth.post(url, this.creds.oauth_access_token, 
      this.creds.oauth_access_token_secret, params, tweasycb);
  }
  return req;
}

TweasyClient.prototype.user = function(params, cb) {
  this.request("http://api.twitter.com/1/users/show.json", params, cb);
}

TweasyClient.prototype.userTimeline = function(params, cb) {
  this.request("http://api.twitter.com/1/statuses/user_timeline.json", params, cb);
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

TweasyClient.prototype.userStream = function() {
  var req = this.request("https://betastream.twitter.com/2b/user.json")
    , stream = new events.EventEmitter()
    , buffer = ''
    , end = '\r\n'
    ;
  stream.addListener("data", function (chunk) {
    var blob;
    buffer += chunk.toString('utf8');
    if (buffer.indexOf(end) !== -1) {
      while (buffer.indexOf(end) !== -1) {
        blob = buffer.slice(0, buffer.indexOf(end));
        buffer = buffer.slice(buffer.indexOf(end) + end.length);
        if (blob.length > 0) {
          stream.emit('line', blob);
        }
      }
    }
  });
  stream.addListener("line", function(blob) {
    var json;
    try {json = JSON.parse(blob);}
    catch(e) {stream.emit('json-error', e, blob)}
    if (json) {
      stream.emit("json", json)
    }
  });
  req.socket.addListener("error",function(e) {
    stream.emit("error", e);
  });
  req.addListener('response', function(resp) {
    resp.setEncoding('utf8');
    resp.addListener('data', function (chunk) {
      stream.emit("data", chunk);
    });
    resp.addListener('end', function () {
      stream.emit('end');
    });
  });
  req.end();
  return stream;
};

exports.init = function(oauth, creds) {
  return new TweasyClient(oauth, creds);
};

