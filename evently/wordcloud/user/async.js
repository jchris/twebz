function(cb, e, params) {
  var widget = $(this)
  , app = $$(widget).app
  , cloud = app.require("lib/wordcloud")
  , name = params.screen_name
  ;
  app.view("globalWordCount", {
    "group" : true,
    success : function(view) {
      var gWC = cloud.globalCount(view);
      app.view("userWordCount",{
        startkey : [name],
        endkey : [name, {}],
        group : true,
        success : function(view) {
          var userWords = cloud.userCount(view, gWC);
          cb(userWords);
        }
      });
    }
  });
};