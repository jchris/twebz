function(userWords, e) {
  var w, cloud = [];
  for (var i=0; i < userWords.length; i++) {
    w = userWords[i];
    if (w.weight >= 2.718) {
      cloud.push({
        word : w.word,
        count : w.count,
        size : (Math.log(w.weight)) * 10
      });
    }
  };
  return {
    cloud : cloud
  };
};