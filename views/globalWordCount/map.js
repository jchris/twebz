function(tweet) {
  if (tweet.id && tweet.text) {
    var wordCounts = {};
    var words = tweet.text.toLowerCase().split(/\s/);
    words.forEach(function(word) {
      if (word.match(/\/|\:/)||word.match(/^@/)) return;
      word = word.replace(/[^\w\-_'\.\@]/g,"").replace(/\W*$/,"").replace(/^\W*/,"").replace(/'\w{1,2}$/,"");
      if (word.length > 2) {
        wordCounts[word] = wordCounts[word] || 0;
        wordCounts[word]++;
      }
    });
    for (var w in wordCounts) {
      if (wordCounts.hasOwnProperty(w))
        emit(w, (parseInt(wordCounts[w]) || 0));
    }
  }
};
