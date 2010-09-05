function() {
  var val = $(this).val()
    , chars = $(".chars", $(this).parents("form"))
    ;
  chars.text(140 - val.length);
};