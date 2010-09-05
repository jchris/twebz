function(resp) {
  var app = $$(this).app,
  linkup = app.require("vendor/couchapp/lib/linkup");
  return {
    tweets : resp.rows.map(function(r) {
      var v = r.doc, user = v.user;
      return {
        image_url : user.profile_image_url,
        name : user.screen_name,
        nickname : user.name,
        message : linkup.encode(v.text, "#/user/")
      };
    })
  }
};