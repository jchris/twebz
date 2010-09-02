function(tweet) {
  if (tweet.id && tweet.text && tweet.user && tweet.user.id) {
    var wordCounts = {};
    var words = tweet.text.toLowerCase().split(/\s/);
    words.forEach(function(word) {
      word = word.replace(/[\.:,!]*$/g,'');
      if (word.length > 2) {
        wordCounts[word] = wordCounts[word] || 0;
        wordCounts[word]++;
      }
    });
    for (var w in wordCounts) {
      emit([tweet.user.id, w], wordCounts[w]);
    }
  }
};
