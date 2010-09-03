function(userWords, e, params) {
  var w, cloud = [];
  for (var i=0; i < userWords.length; i++) {
    w = userWords[i];
    if (w.weight >= 2.718) {
      cloud.push({
        word : w.word,
        size : (Math.log(w.weight)) * 10
      });
    }
  };
  return {
    name : params.screen_name,
    cloud : cloud
  };
};