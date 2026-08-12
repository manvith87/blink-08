// node:sqlite doesn't ship a db.transaction(fn) helper the way
// better-sqlite3 did, so this wraps the same BEGIN/COMMIT/ROLLBACK
// pattern by hand. Usage:
//
//   const runBatch = withTransaction(db, (items) => {
//     items.forEach(item => insertStmt.run(item));
//   });
//   runBatch(myArray);

function withTransaction(db, fn) {
  return function (...args) {
    db.exec("BEGIN");
    try {
      const result = fn(...args);
      db.exec("COMMIT");
      return result;
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  };
}

module.exports = { withTransaction };
