function(e, username) {
  if (username) {
    return {
      error : username + " is missing"
    }
  } else {
    return $$("#account").userCtx;    
  }
};