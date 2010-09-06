function(resp) {
  var items = $(this).parents("#items")
    , lis = $("li", items)
    , more = $("a[href=#more]", items)
    ;
  if (lis.length < 10) {
    more.click();
  }

};
