function(newDoc, oldDoc, userCtx, secObj) {
  // protected tweets cannot be saved
  if (newDoc.text && newDoc.user && newDoc.user["protected"]) {
    if (!(secObj.readers && (secObj.readers.names || secObj.readers.roles)) ||
      (secObj.readers.names.length + secObj.readers.roles.length) == 0) {
      throw({forbidden : "you must have a read-restricted database to save protected tweets"});
    }
  }
  return true;
  // validations todo
  // users can only create a link-account doc for their own self
  // only admin or twebz user can edit twebz-status doc
  // state machine ordering (especially state can't be changed to unsent)
};
