function(seq, req) {
  var mutated = true, min = 0, term, count, row
    , i, top = parseInt(req.query.top), match = [];
  while (row = getRow()) {
    term = row.key[0];
    count = row.value;
    if (match.length < top) {
      match.push([term, count]);
    } else {
      if (count > min) {
        mutated = true;
        match = match.sort(function(a, b) {
          return a[1] < b[1];
        });
        match.length = Math.min(match.length, top-1);
        match.push([term, count]);
      }
      if (mutated) {
        min = Infinity;
        for (i=0; i < match.length; i++) {
          if (match[i][1] < min) {
            min = match[i][1];
          }
        };
        mutated = false;
      }
    }
  }
  match = match.sort(function(a, b) {
    return a[1] < b[1];
  });
  return JSON.stringify(match.map(function(m) {return m[0]}));
};