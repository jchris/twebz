function() {
  var val = $(this).val()
    , txt = $(":selected", this).text()
    ;
  $.cookie("twitter_name", txt);
  $.cookie("twitter_acct", val);
  return false;
};