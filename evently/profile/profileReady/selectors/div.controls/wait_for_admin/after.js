function() {
  var w = $(this);
  setTimeout(function() {
    w.trigger("_init");
  }, 500);
};