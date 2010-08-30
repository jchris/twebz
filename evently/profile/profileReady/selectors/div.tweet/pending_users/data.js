function(resp) {
  return {
    users : resp.rows.map(function(r) {
      return {name:r.value};
    })
  }
};