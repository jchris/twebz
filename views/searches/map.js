function(doc) {
  if (doc.twebz && doc.twebz.acct && doc.twebz.acct.screen_name && doc.searches) {
    emit(doc.twebz.acct.user_id, {
      screen_name : doc.twebz.acct.screen_name,
      searchTerms : doc.searches.map(function(s) {return s.query})
    });
  }
};