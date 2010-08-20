function(r) {
  var v = r.value, user = v.user,
    app = $$(this).app,
    linkup = app.require("vendor/couchapp/lib/linkup");
  return {
    image_url : user.profile_image_url,
    name : user.screen_name,
    nickname : user.name,
    message : linkup.encode(v.text)
  };
};