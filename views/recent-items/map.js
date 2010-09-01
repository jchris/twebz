function(doc) {
  if (doc.text && doc.user && doc.created_at) {
    emit(new Date(doc.created_at), doc);
  }
};