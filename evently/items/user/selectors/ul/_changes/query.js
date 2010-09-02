function(e) {
  var name = e.data.args[1].screen_name.toLowerCase();
  return {
    "view" : "recent-by-user",
    "descending" : "true",
    startkey : [name, {}],
    endkey : [name],
    "limit" : 50
  }
};