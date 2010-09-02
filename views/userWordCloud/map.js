function(tweet) {
  if (tweet.id && tweet.text && tweet.user && tweet.user.screen_name) {
    var wordCounts = {};
    var words = tweet.text.toLowerCase().split(/\s/);
    words.forEach(function(word) {
      if (word.match(/\/|\:/)) return;
      word = word.replace(/[^\w\-_'\.\@]/g,"").replace(/\W*$/,"").replace(/^\W*/,"").replace(/'\w{1,2}$/,"");
      if (word.length > 2) {
        wordCounts[word] = wordCounts[word] || 0;
        wordCounts[word]++;
      }
    });
    for (var w in wordCounts) {
      if (wordCounts.hasOwnProperty(w))
        emit([tweet.user.screen_name, w], (parseInt(wordCounts[w]) || 0));
    }
  }
};
