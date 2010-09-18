function() {
  var widget = $(this)
    , term = $("input[name=users]", widget).val()
    , app = $$(widget).app
    , nonce = Math.random()
    ;
  $$(widget).nonce = nonce;
  app.db.list("twebz/topN","userWordCount", {
    startkey : [term],
    endkey : [term+"\u9999"],
    group_level : 1,
    top : 10,
    success : function(list) {
      if ($$(widget).nonce == nonce) {
        $("form.users span.matches").html(list.map(function(t) {
          return '<a href="#/user/'+t+'">'+t+'</a>';
        }).join(' '));
      }
    }
  });
};