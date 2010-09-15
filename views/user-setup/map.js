function(doc) {
  if (doc.twebz && doc.twebz.type =="user-setup") {
    emit(doc.twebz.state, doc.username);
  }
};
