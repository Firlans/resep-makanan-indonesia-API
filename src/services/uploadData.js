const multer = require('multer');

// Konfigurasi Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Konfigurasi Google Cloud Storage
const gc = new Storage({
  keyFilename: path.join(__dirname, 'path/to/your-service-account-file.json'), // Sesuaikan path ke file kunci JSON Anda
  projectId: 'recipes-api-424908' 
});