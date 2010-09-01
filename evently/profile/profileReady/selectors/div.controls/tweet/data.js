function(resp) {
  var data = {
    twitter_accounts : []
  };
  for (var i=0; i < resp.rows.length; i++) {
    data.twitter_accounts.push(resp.rows[i].value.access_params);
  };
  return data;
};
