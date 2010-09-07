function() {
  var li = $(this).parents("li")
    , id = li.attr("data-id")
    , in_reply_to_user = $(".name a", li).attr("title")
    ;
  $('[name=in_reply_to_status_id]').val(id);
  $('[name=status]').val("@"+in_reply_to_user+" ");
  $('[name=status]').focus();
};