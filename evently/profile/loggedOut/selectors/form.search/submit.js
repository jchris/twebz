function() {
  var term = $("input[name=search]", this).val();
  $.pathbinder.go("/search/"+term);
  return false;
};