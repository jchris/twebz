function(e) {
  var term = e.data.args[1].term.toLowerCase()
    , name = e.data.args[1].screen_name
    , startkey = [term, {}]
    , endkey = [term]
    , view = "globalWordCount"
    ;
  if (name) {
    startkey = [name.toLowerCase(), term, {}];
    endkey = [name.toLowerCase(), term];
    view = "userWordCount";
  }
  var def = {
    "view" : view,
    "descending" : "true",
    reduce : false,
    include_docs : true,
    startkey : startkey,
    endkey : endkey,
    "limit" : 50
  };
  return def;
};