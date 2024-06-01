// const mysql = require("mysql");

// // configuration server mysql connection
// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "12345678",
//   database: "db_indonesian_food_recipes",
// });

// module.exports = db;

let ingredients = [
  {
   name: 'Jahe', manfaat: '', dapatDiolahMenjadi : '',
   name: 'Kunyit', manfaat: '', dapatDiolahMenjadi: '',
   name: 'Vanili', manfaat: '', dapatDiolahMenjadi: ''
  }
]

let recipes = [
  {
    id: 1, resep: 'ayam woku manado', bahanBahan: '', langkahLangkah: '',
    id: 2, resep: 'sop ayam', bahanBahan: '', langkahLangkah: '',
    id: 3, resep: 'gurame saus padang', bahanBahan: '', langkahLangkah: '',
    id: 4, resep: 'bandeng presto', bahanBahan: '', langkahLangkah: ''
  }
]

module.exports = {
  ingredients,
  recipes
}