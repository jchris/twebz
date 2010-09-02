function(view) {
  var row, i, gWC = [], max =0, count, total = 0,
    maxPerc, multpl;
  
  for (i=0; i < view.rows.length; i++) {
    count = view.rows[i].value;
    total += count;
    if (count > max) max = count;
  }
  maxPerc = max / total;
  multpl = 100 / maxPerc;
  for (i=0; i < view.rows.length; i++) {
    row = view.rows[i];
    if (row.value > 4) {
      gWC.push({word: row.key, size:5+10*Math.log(1+(row.value / total) * multpl)});
    }
  };
  return {
    cloud : gWC
  };
};