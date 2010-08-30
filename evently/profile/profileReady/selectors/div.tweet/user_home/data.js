function() {
  var data = {};
  if ($$("#account").userCtx.roles.indexOf("_admin") != -1) {
    data.admin = true;
  }
  return data;
};