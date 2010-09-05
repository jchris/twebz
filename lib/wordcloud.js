exports.globalCount = function(view) {
  var row, i, gWC = {}, total = 0;
  
  for (i=0; i < view.rows.length; i++) {
    total += view.rows[i].value;
  }
  for (i=0; i < view.rows.length; i++) {
    row = view.rows[i];
    if (row.value > 2) {
      gWC[row.key[0]] = row.value / total;
    }
  };
  return gWC;
};

exports.userCount = function(view, gWC) {
  var row, i, uWC = [], total = 0;
  for (i=0; i < view.rows.length; i++) {
    total += view.rows[i].value;
  }
  for (i=0; i < view.rows.length; i++) {
    row = view.rows[i];
    if (row.value > 2) {
      uWC.push({
        word: row.key[1], 
        count : row.value,
        weight:((row.value / total) / (gWC[row.key[1]] || 1/total) )
      });
    }
  };
  return uWC;
};
