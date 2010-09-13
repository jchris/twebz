function(e) {
  var name = e.data.args[1].name.toLowerCase()
    , startkey = [name, {}]
    , endkey = [name]
    , view = "mentions"
    ;
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