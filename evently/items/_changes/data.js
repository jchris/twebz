function(data) {
  // $.log(data)
  var v, user;
  return {
    items : data.rows.map(function(r) {
      v = r.value; user = v.user;
      return {
        image_url : user.profile_image_url,
        name : user.screen_name,
        nickname : user.name,
        message : v.text
      };
    })
  }
};