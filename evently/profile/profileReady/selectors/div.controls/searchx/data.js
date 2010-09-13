function(data) {
  var users = data.rows.map(function(r) {
    return {
      id : r.key,
      name : r.value.screen_name,
      terms : r.value.searchTerms.map(function(t) {
        return {term : t};
      })
    };
  });
  return {
    users : users
  };
};