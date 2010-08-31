function(resp) {
  var data = {
    twitter_accounts : []
  };
  if ($$("#account").userCtx.roles.indexOf("_admin") != -1) {
    data.admin = true;
  }
  for (var i=0; i < resp.rows.length; i++) {
    data.twitter_accounts.push({name:resp.rows[i].key});
  };
  return data;
};