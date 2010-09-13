function(tweet) {
  if (tweet.id && tweet.text) {
    var date = new Date(tweet.created_at);
    var mentions = {};
    var words = tweet.text.toLowerCase().split(/\s/);
    words.forEach(function(word) {
      if (word.match(/^@/)) {
        word = word.replace(/\W*$/,"").replace(/^\W*/,"").replace(/'\w{1,2}$/,"");
        mentions[word] = true;
      }
    });
    for (var w in mentions) {
      if (mentions.hasOwnProperty(w))
        emit([w, date], 1);
    }
  }
};
