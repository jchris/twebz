function(doc) {
  var la;
  if (doc.twebz && doc.twebz.type == "link_account") {
    la = doc.twebz;
    emit([la.state, la.couch_user], la);
  }
};