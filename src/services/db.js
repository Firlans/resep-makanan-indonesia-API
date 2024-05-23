const mysql = require("mysql");

// configuration server mysql connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "db_indonesian_food_recipes",
});

module.exports = db;