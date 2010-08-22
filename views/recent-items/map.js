function(doc) {
  if (doc.text && doc.user) {
    emit(new Date(doc.created_at), doc);
  }
};