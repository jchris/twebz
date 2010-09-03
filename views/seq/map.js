function(doc) {
  if (doc.twebz && doc.twebz.seq) {
    emit(null, parseInt(doc.twebz.seq));
  }
};