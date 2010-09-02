function(e, params) {
  var name = params.screen_name;
  return {
    "view" : "userWordCloud",
    startkey : [name],
    endkey : [name, {}],
    "group" : true    
  }
};
