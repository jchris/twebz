function(doc) {
  var la;
  if (doc.tweb && doc.tweb.link_account) {
    la = doc.tweb.link_account;
    emit([la.state, la.couch_user], la.service);
  }
};