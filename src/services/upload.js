const { Storage } = require("@google-cloud/storage");
const multer = require("multer");
const path = require("path");

const storage = new Storage({
  projectId: "your-google-cloud-project-id",
  keyFilename: "my-project-1-416523-c7d437834c9c.json",
});


const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image."), false);
    }
  },
});

// Fungsi untuk mengunggah file ke Google Cloud Storage
const uploadToGCS = (file, id_user, bucketName) => {
  const bucket = storage.bucket(bucketName);
  return new Promise((resolve, reject) => {
    const filename = `avatar-${id_user}${path.extname(file.originalname)}`;
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      gzip: true,
    });

    blobStream.on("error", (err) => {
      reject(err);
    });

    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

module.exports = { upload, uploadToGCS };
