// utils/generateToken.js
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Le token expirera dans 30 jours
  });
};

module.exports = generateToken;