function(doc) {
  if (doc.state == "has_access" && doc.access_params) {
    emit(doc.access_params.user_id, doc);
  }
};