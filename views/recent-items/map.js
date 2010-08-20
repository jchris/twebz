function(doc) {
  if (doc.text && doc.user) {
    emit(doc._id, doc);
  }
};