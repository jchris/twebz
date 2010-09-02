function(e) {
  var params = e.data.args[1];
  return {
    "view" : "recent-by-user",
    "descending" : "true",
    startkey : [params.screen_name, {}],
    endkey : [params.screen_name],
    "limit" : 50,
    "type" : "newRows"
  }
};