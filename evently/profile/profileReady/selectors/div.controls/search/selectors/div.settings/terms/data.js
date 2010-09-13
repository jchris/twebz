function(doc) {
  return {
    name : doc.twebz.acct.screen_name,
    terms : doc.searches.map(function(s) {
      return {term:s.query};
    })
  };
};