function(e) {
  var term = e.data.args[1].term.toLowerCase();
  return {
    "view" : "globalWordCount",
    "descending" : "true",
    reduce : false,
    include_docs : true,
    key : term,
    // startkey : [term, {}],
    // endkey : [term],
    "limit" : 50
  }
};