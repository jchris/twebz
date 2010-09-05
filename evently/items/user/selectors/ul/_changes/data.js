function(resp) {
  var app = $$(this).app
    , linkup = app.require("vendor/couchapp/lib/linkup")
    , items = $(this).parents("#items")
    , more = $("a[href=#more]", items)
    ;
  if (resp.rows.length < 10) {
    more.click();
  }
  return {
    tweets : resp.rows.map(function(r) {
      var v = r.value, user = v.user;
      return {
        image_url : user.profile_image_url,
        name : user.screen_name,
        nickname : user.name || user.screen_name,
        message : linkup.encode(v.text, "#/user/")
      };
    })
  }
};