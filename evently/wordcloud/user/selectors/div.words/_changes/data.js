function(userWords, e) {
  var w, cloud = []
    , name = e.data.args[1].screen_name.toLowerCase()
    ;
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
    name : name,
    cloud : cloud
  };
};