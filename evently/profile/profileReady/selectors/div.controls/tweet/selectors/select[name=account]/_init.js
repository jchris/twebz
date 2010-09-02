function() {
  var val = $(this).val();
  $.cookie("twitter_acct", val);
  return false;
};