function(tweet) {
  if (tweet.id && tweet.text && tweet.user && tweet.user.screen_name) {
    var wordCounts = {};
    var date = new Date(tweet.created_at);
    var words = tweet.text.toLowerCase().split(/[^\w\-_'\:\/\.\@]/);
    var name = tweet.user.screen_name.toLowerCase();
    words.forEach(function(word) {
      if (word.match(/\/|\:/)||word.match(/^@/)) return;
      word = word.replace(/[^\w\-_'\.\@]/g,"").replace(/\W*$/,"").replace(/^\W*/,"").replace(/'\w{1,2}$/,"");
      if (word.length > 2) {
        wordCounts[word] = true;
      }
    });
    for (var w in wordCounts) {
      if (wordCounts.hasOwnProperty(w))
        emit([name, w, date], 1);
    }
  }
};
