function(doc) {
  if (doc.type =="user-setup") {
    emit(doc.state, doc.username);
  }
};
