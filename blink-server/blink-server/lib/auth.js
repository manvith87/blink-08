// Password hashing + JWT helpers. bcryptjs (pure JS, no native build
// step) rather than bcrypt — one less thing that can fail to install
// on a random host.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}

function comparePassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in .env");
  }
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { hashPassword, comparePassword, signToken, verifyToken };
