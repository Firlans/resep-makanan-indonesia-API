const db = require("./db");

// save data user
const saveData = (query, values) => {
  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results, fields) => {
      if (error) {
        console.error("Error executing query:", error);
        return reject(error);
      }
      resolve(results);
    });
  });
};

// // get user to login
// const getUser = (values, callback) => {
//   return new Promise((resolve, reject) => {
//     const query =
//       "SELECT name, email, idAvatar FROM users WHERE email = ? AND password = ?";
//     db.query(query, values, (error, results) => {
//       if (error) {
//         console.error(error);
//         return callback(error);
//       }
//       callback(null, results);
//     });
//   })
// };

// get all users
const getUsers = () => {
  return new Promise((resolve, reject) => {
      const query = "SELECT * FROM users";
      db.query(query, (error, results) => {
          if (error) {
              return reject(error);
          }
          resolve(results);
      });
  });
};

module.exports = { saveData, getUsers };
