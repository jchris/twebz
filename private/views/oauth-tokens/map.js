function(doc) {
  if (doc.type && doc.state) {
    emit([doc.type, doc.state], null);
  }
};