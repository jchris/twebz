function() {
  var a = $(this)
    , name = a.attr("href").replace("#",'')
    , controls = $("#profile .controls")
    ;
  controls.trigger(name);
  return false;
};