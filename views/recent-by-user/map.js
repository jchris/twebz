function(doc) {
  if (doc.text && doc.user && doc.created_at) {
    emit([doc.user.screen_name ,new Date(doc.created_at)], doc);
  }
};