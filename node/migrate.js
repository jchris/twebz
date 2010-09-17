var couchdb = require("couchdb")
  , client = couchdb.createClient(5984, "127.0.0.1", "jchris", "jchris")
  , db = client.db("twebz")
  ;
  
function renameDoc(rows) {
  process.nextTick(function() {
    while (r = rows.pop()) {
      if (r.id == parseInt(r.id).toString()) {
        break;
      }
    }
    // var r = rows.pop();
    console.log(r.id);
    db.getDoc(r.id, function(er, doc) {
      if (er) {
        console.log(["err getDoc", er])
      } else {
        var rev = doc._rev;
        var oldid = doc._id;
        delete doc._rev;
        doc._id = "twitter-"+doc._id;
        db.saveDoc(doc, function(er, resp) {
          if (er && er.error != "conflict") {
            console.log(er)
          } else {
            db.removeDoc(oldid, rev, function(er) {
              if (er) {
                console.log(["error deleting", oldid, er])
              } else {
                console.log("renamed", oldid)
                renameDoc(rows);
              }
            });
          }
        });
      }
    });
  });
};
  
db.allDocs(function(er, view) {
  console.log("got rows", view.rows.length)
  renameDoc(view.rows)
});