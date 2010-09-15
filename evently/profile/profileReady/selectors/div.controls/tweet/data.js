function(resp) {
  var acct, data = {
      twitter_accounts : []
    }, current = $.cookie("twitter_acct");
  if (resp.rows.length == 0) {
    $(this).trigger("accounts");
    return false;
  }
  for (var i=0; i < resp.rows.length; i++) {
    acct = resp.rows[i].value.access_params;
    if (acct.user_id == current) {
      acct.selected = "selected";
    }
    data.twitter_accounts.push(acct);
  };
  return data;
};
