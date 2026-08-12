// Requiring db/index.js is what actually creates the tables (see the
// comment there). This script exists so you can run migrations as a
// distinct, explicit step in a deploy pipeline: `npm run migrate`.

require("dotenv").config();
require("./index");

console.log("Migration complete — schema is up to date.");
process.exit(0);
