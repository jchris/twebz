function() {
  var widget = $(this)
    , term = $("input[name=search]", widget).val()
    , app = $$(widget).app
    , nonce = Math.random()
    ;
  $$(widget).nonce = nonce;
  app.db.list("twebz/topN","globalWordCount", {
    startkey : [term],
    endkey : [term+"\u9999"],
    group_level : 1,
    top : 10,
    success : function(list) {
      if ($$(widget).nonce == nonce) {
        $("form.search span.matches").html(list.map(function(t) {
          return '<a href="#/search/'+t+'">'+t+'</a>';
        }).join(' '));
      }
    }
  });
};