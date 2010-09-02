function() {
  return true;
  // validations todo
  // users can only create a link-account doc for their own self
  // only admin or twebz user can edit twebz-status doc
  // protected tweets cannot be saved
  // state machine ordering (especially state can't be changed to unsent)
};