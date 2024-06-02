require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (
  email,
  id = "",
  name = "",
  phoneNumber = "",
  idAvatar = "",
  password = ""
) => {
  const payload = { email };
  if (id) payload.id = id;
  if (name) payload.name = name;
  if (password) payload.password = password;
  if (phoneNumber) payload.phoneNumber = phoneNumber;
  if (idAvatar) payload.idAvatar = idAvatar;
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
};

module.exports = generateToken;
