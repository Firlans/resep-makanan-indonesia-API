const { Storage } = require("@google-cloud/storage");
const multer = require("multer");
const path = require("path");

const storage = new Storage({
  projectId: process.env.ID_PROJECT,
  keyFilename: process.env.SERVICE_ACCOUNT,
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
const uploadToGCS = (file, fileName, bucketName) => {
  const bucket = storage.bucket(bucketName);
  return new Promise((resolve, reject) => {
    const blob = bucket.file(fileName);
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

const deleteFile = async (fileName, bucketName) => {
  try {
    if(fileName === "avatar-0") return
    const filePatch = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    await storage.bucket(bucketName).file(filePatch).delete();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete file");
  }
}

module.exports = { upload, uploadToGCS, deleteFile };
