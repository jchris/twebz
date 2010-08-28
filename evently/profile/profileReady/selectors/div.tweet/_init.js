function() {
  var widget = $(this), app = $$(widget).app;
  app.db.openDoc("twebz-config", {
    success : function(doc) {
      if (doc.twitter_keypair) {
        widget.trigger("keyring");
      } else {
        widget.trigger("twitter_keypair");
      }
    },
    error : function() {
      widget.trigger("twitter_keypair");
    }
  });
};