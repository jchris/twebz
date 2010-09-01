var TweasyClient;

TweasyClient = function(creds) {
  var client = this;
  this.creds = creds;
};

TweasyClient.prototype.user = function(params) {
  
}

exports.createClient = function(creds) {
  return new TweasyClient(creds);
};

