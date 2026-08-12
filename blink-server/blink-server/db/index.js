// Uses Node's built-in node:sqlite module instead of a third-party
// package — no native binary to compile, no install-script gotchas,
// nothing that can go out of date with a new Node release. Requires
// Node 22.13+ (bare `node:sqlite`, no --experimental-sqlite flag).

const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "blink.db");
const db = new DatabaseSync(DB_PATH);

db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
db.exec(schema);

module.exports = db;
