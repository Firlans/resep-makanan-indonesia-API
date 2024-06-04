require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
};

module.exports = generateToken;
