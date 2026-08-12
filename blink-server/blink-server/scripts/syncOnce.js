// Handy for a cron job or a manual one-off refresh:
//   npm run sync
//   npm run sync -- "machine learning"

require("dotenv").config();
const { syncAll } = require("../lib/syncService");

const query = process.argv[2] || "";

syncAll(query)
  .then((results) => {
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
  });
