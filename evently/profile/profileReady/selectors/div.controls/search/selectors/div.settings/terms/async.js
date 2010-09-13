function(cb, e, params) {
  var widget = $(this)
  , app = $$(widget).app
  ;
  app.db.openDoc("saved-searches-"+params.user_id,{
    success : cb
  });
};